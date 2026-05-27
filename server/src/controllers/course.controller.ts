import { Request, Response } from "express";
import { CourseService } from "../services/course.service";
import {
    CreateCourseType,
    CourseIdType,
    UpdateCourseType,
} from "../validations/course.validation";
import { GetCoursesQuery } from "../types/course.type";

export class CourseController {
    private courseService = new CourseService();

    // [POST] /api/courses
    create = async (req: Request<any, any, CreateCourseType>, res: Response) => {
        try {
            const course = await this.courseService.createCourse(req.body);
            res.status(201).json({ message: "Tạo khóa học thành công", data: course, success: true });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message, success: false });
        }
    };

    // [GET] /api/courses
    getAll = async (req: Request<any, any, any, GetCoursesQuery>, res: Response) => {
        try {
            const { courses, total } = await this.courseService.getAllCourses(req.query);
            res.status(200).json({ data: courses, totalCount: total, success: true });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message, success: false });
        }
    };

    // [GET] /api/courses/:id
    getOne = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const course = await this.courseService.getCourseById(id as string);
            if (!course)
                return res.status(404).json({ message: "Không tìm thấy khóa học", success: false });
            res.status(200).json({ data: course, success: true });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message, success: false });
        }
    };

    // [PUT] /api/courses/:id
    update = async (
        req: Request<CourseIdType, any, UpdateCourseType>,
        res: Response,
    ) => {
        try {
            const { id } = req.params;
            const course = await this.courseService.updateCourse(id, req.body);
            if (!course)
                return res.status(404).json({ message: "Không tìm thấy khóa học để sửa", success: false });
            res.status(200).json({ message: "Cập nhật thành công", data: course, success: true });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message, success: false });
        }
    };

    // [DELETE] /api/courses/:id
    delete = async (req: Request<CourseIdType>, res: Response) => {
        try {
            const { id } = req.params;
            const course = await this.courseService.deleteCourse(id);
            if (!course)
                return res.status(404).json({ message: "Không tìm thấy khóa học để xóa", success: false });
            res.status(200).json({ message: "Xóa khóa học thành công", success: true });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message || "Lỗi Server", success: false });
        }
    };
}
