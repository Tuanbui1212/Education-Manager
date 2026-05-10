import { ClassModel } from '../models/class.model';
import { ScheduleModel } from '../models/schedule.model';
import { CreateScheduleType, UpdateScheduleType } from '../validations/schedule.validation';
import { ShiftModel } from '../models/shift.model';
import { RoomModel } from '../models/room.model';
import { UserModel } from '../models/user.model';
import { GetSchedulesQuery } from '@/types/schedule.type';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

export class ScheduleService {
  async createSchedule(schedule: CreateScheduleType) {
    const roomConflict = await ScheduleModel.findOne({
      date: schedule.date,
      shiftId: schedule.shiftId,
      roomId: schedule.roomId,
    });
    if (roomConflict) {
      throw new Error(`Phòng học này đã có lớp ${roomConflict.classId} đăng ký trong khung giờ này`);
    }

    if (schedule.teacherId) {
      const teacherConflict = await ScheduleModel.findOne({
        date: schedule.date,
        shiftId: schedule.shiftId,
        teacherId: schedule.teacherId,
      });
      if (teacherConflict) {
        throw new Error('Giáo viên này đã có lịch dạy lớp khác trong khung giờ này');
      }
    }

    const classConflict = await ScheduleModel.findOne({
      date: schedule.date,
      shiftId: schedule.shiftId,
      classId: schedule.classId,
    });
    if (classConflict) {
      throw new Error('Lớp học này đã có lịch học trong khung giờ này rồi');
    }

    const existingSchedule = await ScheduleModel.findOne({
      classId: schedule.classId,
      shiftId: schedule.shiftId,
      roomId: schedule.roomId,
      date: schedule.date,
    });
    if (existingSchedule) {
      throw new Error('Lịch học đã tồn tại');
    }

    if (schedule.teacherId) {
      const existingUser = await UserModel.findById(schedule.teacherId);
      if (!existingUser) {
        throw new Error('Người dùng không tồn tại');
      }
      if (existingUser.status !== 'ACTIVE') {
        throw new Error('Giáo viên này hiện đang ngừng hoạt động, không thể gán lịch');
      }
    }

    const [existingClass, existingShift, existingRoom] = await Promise.all([
      ClassModel.findById(schedule.classId),
      ShiftModel.findById(schedule.shiftId),
      RoomModel.findById(schedule.roomId),
    ]);

    if (!existingClass) throw new Error('Lớp học không tồn tại');
    if (!existingShift) throw new Error('Ca học không tồn tại');
    if (!existingRoom) throw new Error('Phòng học không tồn tại');

    return await ScheduleModel.create(schedule);
  }

  async getAllSchedules(query: GetSchedulesQuery) {
    const { page = 1, limit = 10, classId, roomId, teacherId } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (classId) filter.classId = new Types.ObjectId(classId);
    if (roomId) filter.roomId = new Types.ObjectId(roomId);
    if (teacherId) filter.teacherId = new Types.ObjectId(teacherId);
    const [total, schedules] = await Promise.all([
      ScheduleModel.countDocuments(filter),
      ScheduleModel.find(filter)
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .populate('classId', 'name')
        .populate('shiftId', 'name')
        .populate('roomId', 'name')
        .populate('teacherId', 'fullName')
        .populate('attendances', 'fullName'),
    ]);
    return { schedules, total };
  }

  async getScheduleById(id: string) {
    return await ScheduleModel.findById(id)
      .populate('classId', 'name')
      .populate('shiftId', 'name')
      .populate('roomId', 'name')
      .populate('teacherId', 'fullName')
      .populate('attendances', 'fullName');
  }

  async updateSchedule(id: string, schedule: UpdateScheduleType) {
    const existingSchedule = await ScheduleModel.findById(id);
    if (!existingSchedule) {
      throw new Error('Lịch học không tồn tại');
    }
    if (schedule.classId) {
      const existingClass = await ClassModel.findById(schedule.classId);
      if (!existingClass) {
        throw new Error('Lớp học không tồn tại');
      }
    }
    if (schedule.shiftId) {
      const existingShift = await ShiftModel.findById(schedule.shiftId);
      if (!existingShift) {
        throw new Error('Ca học không tồn tại');
      }
    }
    if (schedule.roomId) {
      const existingRoom = await RoomModel.findById(schedule.roomId);
      if (!existingRoom) {
        throw new Error('Phòng học không tồn tại');
      }
    }
    if (schedule.teacherId) {
      const existingUser = await UserModel.findById(schedule.teacherId);
      if (!existingUser) {
        throw new Error('Người dùng không tồn tại');
      }
    }
    return await ScheduleModel.findByIdAndUpdate(id, schedule, { new: true })
      .populate('classId', 'name')
      .populate('shiftId', 'name')
      .populate('roomId', 'name')
      .populate('teacherId', 'fullName')
      .populate('attendances', 'fullName');
  }

  async deleteSchedule(id: string) {
    return await ScheduleModel.findByIdAndDelete(id);
  }

  async createSchedulesBulk(schedules: CreateScheduleType[], startClass: string) {
    if (!Array.isArray(schedules)) {
      throw new Error('Dữ liệu đầu vào không phải là một danh sách hợp lệ');
    }

    // 1. Khởi tạo session cho Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstSchedule = schedules[0];
    const lastSchedule = schedules[schedules.length - 1];

    try {
      if (firstSchedule && firstSchedule.classId) {
        const startDate = new Date(firstSchedule.date);
        startDate.setHours(0, 0, 0, 0);

        if (startDate <= today) {
          await ClassModel.findByIdAndUpdate(
            firstSchedule.classId,
            { status: 'ACTIVE', startDate: startClass },
            { session },
          );
        } else if (startDate > today) {
          await ClassModel.findByIdAndUpdate(
            firstSchedule.classId,
            { status: 'UPCOMING', startDate: startClass },
            { session },
          );
        }
      }

      if (lastSchedule && lastSchedule.classId) {
        const endDate = new Date(lastSchedule.date);
        endDate.setHours(23, 59, 59, 999);

        if (endDate <= today) {
          await ClassModel.findByIdAndUpdate(lastSchedule.classId, { status: 'COMPLETED' }, { session });
        }
      }

      const createdSchedules = [];

      for (const schedule of schedules) {
        // 2. Kiểm tra xung đột
        const roomConflict = await ScheduleModel.findOne({
          date: schedule.date,
          shiftId: schedule.shiftId,
          roomId: schedule.roomId,
        }).session(session);

        if (roomConflict) {
          throw new Error(`Ngày ${schedule.date}: Phòng này đã được sử dụng.`);
        }

        if (schedule.teacherId) {
          const teacherConflict = await ScheduleModel.findOne({
            date: schedule.date,
            shiftId: schedule.shiftId,
            teacherId: schedule.teacherId,
          }).session(session);

          if (teacherConflict) {
            throw new Error(`Ngày ${schedule.date}: Giáo viên đã có lịch dạy.`);
          }
        }

        // 3. Tạo bản ghi tạm trong session
        const [newSchedule] = await ScheduleModel.create([schedule], { session });
        createdSchedules.push(newSchedule);
      }

      // 4. Nếu mọi thứ ổn -> Chốt dữ liệu
      await session.commitTransaction();
      return createdSchedules;
    } catch (error) {
      // 5. Nếu có bất kỳ lỗi nào -> Hủy bỏ toàn bộ những gì đã làm ở bước 3
      await session.abortTransaction();
      throw error;
    } finally {
      // 6. Đóng phiên
      session.endSession();
    }
  }

  async deleteSchedulesBulk(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new Error('Danh sách ID không hợp lệ');
    }

    const scheduleData = await ScheduleModel.findById(ids[0]);
    if (!scheduleData) {
      throw new Error('Không tìm thấy dữ liệu lịch học để xóa');
    }

    const classId = scheduleData.classId;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await ScheduleModel.deleteMany({ _id: { $in: ids } }, { session });

      await ClassModel.findByIdAndUpdate(classId, { status: 'PENDING' }, { session });

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getStartDateClass(classData: any) {
    const startDate = await ScheduleModel.find({ classId: classData._id }).sort({ date: 1 }).limit(1);
    return startDate;
  }

  async getTodaySchedules() {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const query: any = {
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    // const schedules = await ScheduleModel.find(query)
    //   .populate('classId', 'name studentIds')
    //   .populate('teacherId', 'fullName')
    //   .populate('roomId', 'name')
    //   .populate('shiftId', 'name startTime endTime')
    //   .sort({ 'shiftId.startTime': 1 })
    //   .lean();

    const schedules = await ScheduleModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: '$classInfo' },
      { $match: { 'classInfo.status': 'ACTIVE' } },
      {
        $lookup: {
          from: 'users',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacherInfo',
        },
      },
      { $unwind: '$teacherInfo' },
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'roomInfo',
        },
      },
      { $unwind: '$roomInfo' },
      {
        $lookup: {
          from: 'shifts',
          localField: 'shiftId',
          foreignField: '_id',
          as: 'shiftInfo',
        },
      },
      { $unwind: '$shiftInfo' },
      {
        $sort: {
          'shiftInfo.startTime': 1,
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,

          classId: {
            _id: '$classInfo._id',
            name: '$classInfo.name',
            studentCount: { $size: '$classInfo.studentIds' },
          },

          teacherId: {
            _id: '$teacherInfo._id',
            fullName: '$teacherInfo.fullName',
          },

          roomId: {
            _id: '$roomInfo._id',
            name: '$roomInfo.name',
          },

          shiftId: {
            _id: '$shiftInfo._id',
            name: '$shiftInfo.name',
            startTime: '$shiftInfo.startTime',
            endTime: '$shiftInfo.endTime',
          },
        },
      },
    ]);

    return schedules;
  }
}
