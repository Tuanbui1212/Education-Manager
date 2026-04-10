import { Request, Response } from 'express';
import { ClassService } from '../services/class.service';
import { CreateClassType, UpdateClassType } from '../validations/class.validation';
import { GetClassesQuery, GetStudentsByClassQuery } from '../types/class.type';

export class ClassController {
  private classService = new ClassService();

  // [POST] /api/classes
  create = async (req: Request<{}, {}, CreateClassType>, res: Response) => {
    try {
      const classData = req.body;
      const newClass = await this.classService.createClass(classData);
      res.status(201).json({ success: true, message: 'Tạo lớp học thành công', data: newClass });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [GET] /api/classes
  getAll = async (req: Request<{}, {}, {}, GetClassesQuery>, res: Response) => {
    try {
      const { classes, total } = await this.classService.getAllClasses(req.query);
      res.status(200).json({ success: true, data: classes, message: 'Lấy danh sách lớp học thành công', total: total });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [GET] /api/classes/:id
  getOne = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const classData = await this.classService.getClassById(id);
      if (!classData) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
      res.status(200).json({ success: true, data: classData });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [PUT] /api/classes/:id
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
  };

  // [DELETE] /api/classes/:id
  delete = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const deletedClass = await this.classService.deleteClass(id);
      if (!deletedClass) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học để xóa' });
      res.status(200).json({ success: true, message: 'Xóa lớp học thành công' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [GET] /api/classes/:id/students
  getAllStudents = async (req: Request<{ id: string }, {}, {}, GetStudentsByClassQuery>, res: Response) => {
    try {
      const { id } = req.params;
      const classesData = await this.classService.getAllStudentByClass(id, req.query);
      res.status(200).json({
        success: true,
        data: classesData[0]?.studentDetails || [],
        message: 'Lấy danh sách học viên thành công',
        total: classesData[0]?.totalStudentCount || 0,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  //[GET] /api/classes/student/:id
  getClassByStudentId = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const { classesData, totalCount } = await this.classService.getClassByStudentId(id);

      res.status(200).json({
        success: true,
        data: classesData,
        total: totalCount,
        message: 'Lấy danh sách lớp học thành công',
      });
    } catch (error) {
      console.error(`[getClassByStudentId] Lỗi: `, error);
      res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
    }
  };

  //[POST] /api/classes/enroll
  enroll = async (req: Request, res: Response) => {
    try {
      const result = await this.classService.enrollStudent(req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  //[POST] /api/classes/unenroll
  unEnroll = async (req: Request, res: Response) => {
    try {
      const result = await this.classService.unenrollStudent(req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
}
