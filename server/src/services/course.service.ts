import { CreateCourseType, UpdateCourseType } from "../validations/course.validation";
import { CourseModel } from "../models/course.model";
import { GetCoursesQuery, ICourse } from "../types/course.type";
import { ClassModel } from "../models/class.model";
import { Types } from "mongoose";

export class CourseService {
    // 1. Tạo khóa học mới
    async createCourse(data: CreateCourseType): Promise<ICourse> {
        const existingCourse = await CourseModel.findOne({ title: data.title });
        if (existingCourse) {
            throw new Error(`Tiêu đề khóa học ${data.title} đã được sử dụng bởi khóa học khác!`);
        }

        const newCourse = new CourseModel(data);
        return await newCourse.save();
    }

    // 2. Lấy danh sách khóa học
    async getAllCourses(query: GetCoursesQuery): Promise<{
        courses: ICourse[];
        total: number;
    }> {
        const { page = 1, limit = 10, search = "" } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const filter: any = {
            title: { $regex: search, $options: "i" },
        };

        const [total, courses] = await Promise.all([
            CourseModel.countDocuments(filter),
            CourseModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        ]);
        return { courses, total };
    }

    // 3. Lấy chi tiết 1 khóa học
    async getCourseById(id: string): Promise<ICourse | null> {
        return await CourseModel.findById(id);
    }

    // 4. Cập nhật khóa học
    async updateCourse(id: string, data: UpdateCourseType): Promise<ICourse | null> {
        if (data.title) {
            const existingCourse = await CourseModel.findOne({
                title: data.title,
                _id: { $ne: id },
            });
            if (existingCourse) {
                throw new Error(
                    `Tiêu đề khóa học ${data.title} đã được sử dụng bởi khóa học khác!`,
                );
            }
        }
        return await CourseModel.findByIdAndUpdate(id, data, { new: true });
    }

    // 5. Xóa khóa học
    async deleteCourse(id: string): Promise<ICourse | null> {
        const course = await CourseModel.findById(id);
        if (!course) {
            throw new Error(`Khóa học ${id} không tồn tại!`);
        }
        const classesCount = await ClassModel.countDocuments({ courseId: new Types.ObjectId(id) });
        if (classesCount > 0) {
            throw new Error(`Không thể xóa khóa học ${course?.title} vì có ${classesCount} lớp học đang thuộc khóa học này!`);
        }
        return await CourseModel.findByIdAndDelete(id);
    }
}
