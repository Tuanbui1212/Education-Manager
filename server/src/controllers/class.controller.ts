import { Request, Response } from "express";
import { ClassService } from "../services/class.service";
import { CreateClassType, UpdateClassType } from "../validations/class.validation";
import { GetClassesQuery } from "../types/class.type";

export class ClassController {
    private classService = new ClassService();

    create = async (req: Request<{}, {}, CreateClassType>, res: Response) => {
        try {
            const classData = req.body;
            const newClass = await this.classService.createClass(classData);
            res.status(201).json({ success: true, message: 'Tạo lớp học thành công', data: newClass });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    getAll = async (req: Request<{}, {}, {}, GetClassesQuery>, res: Response) => {
        try {
            const { classes, total } = await this.classService.getAllClasses(req.query);
            res.status(200).json({ success: true, data: classes, message: 'Lấy danh sách lớp học thành công', total: total });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    getOne = async (req: Request<{ id: string }>, res: Response) => {
        try {
            const { id } = req.params;
            const classData = await this.classService.getClassById(id);
            if (!classData) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
            res.status(200).json({ success: true, data: classData });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    update = async (req: Request<{ id: string }, {}, UpdateClassType>, res: Response) => {
        try {
            const { id } = req.params;
            const classData = req.body;
            const updatedClass = await this.classService.updateClass(id, classData);
            if (!updatedClass) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học để sửa' });
            res.status(200).json({ success: true, message: 'Cập nhật lớp học thành công', data: updatedClass });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    delete = async (req: Request<{ id: string }>, res: Response) => {
        try {
            const { id } = req.params;
            const deletedClass = await this.classService.deleteClass(id);
            if (!deletedClass) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học để xóa' });
            res.status(200).json({ success: true, message: 'Xóa lớp học thành công' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
