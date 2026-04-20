import { ClassModel } from '../models/class.model';
import { GetClassesQuery, GetStudentsByClassQuery } from '../types/class.type';
import { CreateClassType, UpdateClassType } from '../validations/class.validation';
import { CourseModel } from '../models/course.model';
import { UserModel } from '../models/user.model';
import { RoomModel } from '../models/room.model';
import roleModel from '../models/role.model';
import { Types } from 'mongoose';
import { InvoiceService } from './invoice.service';
import { InvoiceModel } from '../models/invoice.model';
import { ScheduleModel } from '../models/schedule.model';

import mongoose from 'mongoose';
import { fi } from 'zod/v4/locales';
export class ClassService {
  private invoiceService: InvoiceService;

  constructor() {
    this.invoiceService = new InvoiceService();
  }

  async createClass(classData: CreateClassType) {
    const existingClass = await ClassModel.findOne({ name: classData.name });
    if (existingClass) {
      throw new Error('Lớp học đã tồn tại');
    }

    const existingCourse = await CourseModel.findById(classData.courseId);
    if (!existingCourse) {
      throw new Error('Khóa học không tồn tại');
    }

    const existingTeacher = await UserModel.findById(classData.teacherId);
    if (!existingTeacher) {
      throw new Error('Giáo viên không tồn tại');
    } else {
      const teacherRole = await roleModel.findById(existingTeacher.roleId);
      if (teacherRole?.name !== 'Teacher') {
        throw new Error('Người được chọn không phải là giáo viên');
      }
    }

    const existingRoom = await RoomModel.findById(classData.roomId);
    if (!existingRoom) {
      throw new Error('Phòng học không tồn tại');
    }

    if (classData.studentIds && classData.studentIds.length > 0) {
      const existingStudents = await UserModel.find({ _id: { $in: classData.studentIds } });
      if (existingStudents.length !== classData.studentIds.length) {
        throw new Error('Có học viên không tồn tại khi tạo lớp');
      }
    }

    return await ClassModel.create(classData);
  }

  async getAllClasses(query: GetClassesQuery) {
    const { page = 1, limit = 10, search = '', status = '' } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = {
      name: { $regex: search, $options: 'i' },
    };
    if (status) {
      filter.status = status.toUpperCase();
    }
    const [total, classes] = await Promise.all([
      ClassModel.countDocuments(filter),
      ClassModel.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .populate('studentIds', 'fullName')
        .populate('courseId', 'title')
        .populate('teacherId', 'fullName')
        .populate('roomId', 'name'),
    ]);

    return { classes, total };
  }

  async getClassById(id: string) {
    return await ClassModel.findById(id)
      .populate('studentIds', 'fullName')
      .populate('courseId', 'title basePrice')
      .populate('teacherId', 'fullName')
      .populate('roomId', 'name');
  }

  async updateClass(id: string, classData: UpdateClassType) {
    const existingClass = await ClassModel.findOne({ name: classData.name, _id: { $ne: id } });
    if (existingClass) {
      throw new Error('Lớp học đã tồn tại');
    }

    const existingCourse = await CourseModel.findById(classData.courseId);
    if (!existingCourse) {
      throw new Error('Khóa học không tồn tại');
    }

    const existingTeacher = await UserModel.findById(classData.teacherId);
    if (!existingTeacher) {
      throw new Error('Giáo viên không tồn tại');
    }

    const existingRoom = await RoomModel.findById(classData.roomId);
    if (!existingRoom) {
      throw new Error('Phòng học không tồn tại');
    }

    if (classData.studentIds && classData.studentIds.length > 0) {
      const existingStudents = await UserModel.find({ _id: { $in: classData.studentIds } });
      if (existingStudents.length !== classData.studentIds.length) {
        throw new Error('Một hoặc nhiều học viên không tồn tại');
      }
    }
    return await ClassModel.findByIdAndUpdate(id, classData, { new: true });
  }

  async deleteClass(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const classData = await ClassModel.findById(id).session(session);
      if (!classData) {
        throw new Error('Lớp học không tồn tại');
      }

      if (classData.studentIds && classData.studentIds.length > 0) {
        throw new Error(
          'Không thể xóa lớp học khi còn học viên đang ghi danh. Vui lòng hủy ghi danh tất cả học viên trước khi xóa lớp.',
        );
      }

      const invoice = await InvoiceModel.findOne({ classId: id }).session(session);
      if (invoice) {
        throw new Error('Không thể xóa lớp học khi còn hóa đơn liên quan. Vui lòng chuyển trạng thái lớp thay vì xóa.');
      }

      await ScheduleModel.deleteMany({ classId: id }, { session });

      const deletedClass = await ClassModel.findByIdAndDelete(id, { session });

      await session.commitTransaction();

      return deletedClass;
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllStudentByClass(id: string, query: GetStudentsByClassQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 5;
    const search = query.search || '';
    const skip = (page - 1) * limit;
    const filter = {
      _id: new Types.ObjectId(id),
    };

    const classData = await ClassModel.findById(id);
    if (!classData) {
      throw new Error('Không tìm thấy lớp học');
    }

    const classesData = await ClassModel.aggregate([
      {
        $match: filter,
      },
      {
        $addFields: {
          totalStudentCount: {
            $size: { $ifNull: ['$studentIds', []] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { localStudentIds: '$studentIds' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$localStudentIds'],
                },
              },
            },
            {
              $match: {
                fullName: { $regex: search, $options: 'i' },
              },
            },
            {
              $project: {
                fullName: 1,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
          as: 'studentDetails',
        },
      },
    ]);

    return classesData;
  }

  async getClassByStudentId(id: string) {
    const studentObjectId = new Types.ObjectId(id);

    const [classesData, totalCount] = await Promise.all([
      ClassModel.aggregate([
        {
          $match: { studentIds: studentObjectId },
        },
        {
          $lookup: {
            from: 'schedules',
            localField: '_id',
            foreignField: 'classId',
            as: 'schedulesData',
          },
        },
        {
          $lookup: {
            from: 'attendances',
            let: { class_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$classId', '$$class_id'] }, { $eq: ['$studentId', studentObjectId] }],
                  },
                },
              },
            ],
            as: 'studentAttendances',
          },
        },
        {
          $addFields: {
            totalSchedules: { $size: '$schedulesData' },
            presentAttends: {
              $size: {
                $filter: {
                  input: '$studentAttendances',
                  as: 'att',
                  cond: { $eq: ['$$att.status', 'PRESENT'] },
                },
              },
            },
            averageMark: {
              $avg: '$studentAttendances.mark',
            },
          },
        },
        {
          $project: {
            studentIds: 0,
            documents: 0,
            __v: 0,
            schedulesData: 0,
            studentAttendances: 0,
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'courseId',
          },
        },
        {
          $unwind: { path: '$courseId', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'teacherId',
            foreignField: '_id',
            as: 'teacherId',
          },
        },
        {
          $unwind: { path: '$teacherId', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'roomId',
          },
        },
        {
          $unwind: { path: '$roomId', preserveNullAndEmptyArrays: true },
        },
      ]),
      ClassModel.countDocuments({ studentIds: id }),
    ]);

    return { classesData, totalCount };
  }

  async enrollStudent(data: { classId: string; studentId: string; finalAmount: number; dueDate?: string }) {
    {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const currentClass = await ClassModel.findById(data.classId).session(session);
        if (!currentClass) throw new Error('Lớp học không tồn tại');

        const exists = currentClass.studentIds.some((id) => id.toString() === data.studentId);

        if (exists) {
          throw new Error('Học viên này đã có tên trong danh sách lớp');
        }

        await ClassModel.findByIdAndUpdate(data.classId, { $push: { studentIds: data.studentId } }, { session });

        const invoiceCode = await this.invoiceService.generateInvoiceCode();

        const student = await UserModel.findById(data.studentId).session(session);
        if (!student) throw new Error('Không tìm thấy học viên');

        if (student.status === 'INACTIVE') {
          throw new Error('Học viên đã ngừng hoạt động');
        }

        if (student.status === 'POTENTIAL') {
          await UserModel.findByIdAndUpdate(data.studentId, { status: 'ACTIVE' }, { session });
        }

        const consultantId = student.student_info?.consultantId;

        let finalDueDate = data.dueDate ? new Date(data.dueDate) : new Date();
        if (!data.dueDate) {
          finalDueDate.setDate(finalDueDate.getDate() + 7);
        }

        const newInvoice = new InvoiceModel({
          code: invoiceCode,
          studentId: data.studentId,
          classId: data.classId,
          consultantId: consultantId,
          finalAmount: data.finalAmount,
          debt: data.finalAmount,
          status: 'UNPAID',
          dueDate: finalDueDate,
        });

        await newInvoice.save({ session });

        await session.commitTransaction();

        return {
          success: true,
          message: 'Ghi danh và tạo hóa đơn thành công',
          invoiceCode,
        };
      } catch (error: any) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
  }

  async unenrollStudent(data: { classId: string; studentId: string }) {
    {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const student = await UserModel.findById(data.studentId).session(session);
        if (!student) throw new Error('Không tìm thấy học viên');

        const findClass = await ClassModel.findById(data.classId).session(session);
        if (!findClass) throw new Error('Không tìm thấy lớp học');

        const invoice = await InvoiceModel.findOne({ classId: data.classId, studentId: data.studentId }).session(
          session,
        );
        if (!invoice) throw new Error('Không tìm thấy hóa đơn');

        if (invoice.debt === invoice.finalAmount) {
          await InvoiceModel.deleteOne({ classId: data.classId, studentId: data.studentId }, { session });
        } else {
          throw new Error(
            'Học viên đã phát sinh thanh toán cho lớp này. Vui lòng thực hiện hoàn phí (Refund) trước khi hủy ghi danh.',
          );
        }

        findClass.studentIds = findClass.studentIds.filter((id: any) => id.toString() !== data.studentId);

        await findClass.save({ session });

        await session.commitTransaction();

        return {
          success: true,
          message: 'Hủy ghi danh thành công',
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
  }
}
