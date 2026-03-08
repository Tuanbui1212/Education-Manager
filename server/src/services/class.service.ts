import { ClassModel } from "../models/class.model";
import { GetClassesQuery } from "../types/class.type";
import { CreateClassType, UpdateClassType } from "../validations/class.validation";
import { CourseModel } from "../models/course.model";
import { UserModel } from "../models/user.model";
import { RoomModel } from "../models/room.model";

export class ClassService {
    async createClass(classData: CreateClassType) {
        const existingClass = await ClassModel.findOne({ name: classData.name });
        if (existingClass) {
            throw new Error("Lớp học đã tồn tại");
        }

        const existingCourse = await CourseModel.findById(classData.courseId);
        if (!existingCourse) {
            throw new Error("Khóa học không tồn tại");
        }

        const existingTeacher = await UserModel.findById(classData.teacherId);
        if (!existingTeacher) {
            throw new Error("Giáo viên không tồn tại");
        }

        const existingRoom = await RoomModel.findById(classData.roomId);
        if (!existingRoom) {
            throw new Error("Phòng học không tồn tại");
        }

        if (classData.studentIds && classData.studentIds.length > 0) {
            const existingStudents = await UserModel.find({ _id: { $in: classData.studentIds } });
            if (existingStudents.length !== classData.studentIds.length) {
                throw new Error("Có học viên không tồn tại khi tạo lớp");
            }
        }

        return await ClassModel.create(classData);
    }

    async getAllClasses(query: GetClassesQuery) {
        const { page = 1, limit = 10, search = '', status = '' } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter: any = {
            name: { $regex: search, $options: 'i' },
        }
        if (status) {
            filter.status = status.toUpperCase();
        }
        const [total, classes] = await Promise.all([
            ClassModel.countDocuments(filter),
            ClassModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit)
                .populate('courseId', 'title').populate('teacherId', 'fullName').populate('roomId', 'name').populate('studentIds', 'fullName'),
        ]);
        return { classes, total };
    }

    async getClassById(id: string) {
        return await ClassModel.findById(id).populate('courseId', 'title')
            .populate('teacherId', 'fullName').populate('roomId', 'name').populate('studentIds', 'fullName');
    }

    async updateClass(id: string, classData: UpdateClassType) {
        const existingClass = await ClassModel.findOne({ name: classData.name, _id: { $ne: id } });
        if (existingClass) {
            throw new Error("Lớp học đã tồn tại");
        }

        const existingCourse = await CourseModel.findById(classData.courseId);
        if (!existingCourse) {
            throw new Error("Khóa học không tồn tại");
        }

        const existingTeacher = await UserModel.findById(classData.teacherId);
        if (!existingTeacher) {
            throw new Error("Giáo viên không tồn tại");
        }

        const existingRoom = await RoomModel.findById(classData.roomId);
        if (!existingRoom) {
            throw new Error("Phòng học không tồn tại");
        }

        if (classData.studentIds && classData.studentIds.length > 0) {
            const existingStudents = await UserModel.find({ _id: { $in: classData.studentIds } });
            if (existingStudents.length !== classData.studentIds.length) {
                throw new Error("Một hoặc nhiều học viên không tồn tại");
            }
        }
        return await ClassModel.findByIdAndUpdate(id, classData, { new: true });
    }

    async deleteClass(id: string) {
        return await ClassModel.findByIdAndDelete(id);
    }
}