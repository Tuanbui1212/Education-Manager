import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService = new UserService();

  // [POST] /api/users
  create = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json({ success: true, message: 'Tạo user thành công', data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
    }
  };

  // [GET] /api/users
  getAll = async (req: Request, res: Response) => {
    try {
      const { users, totalCount } = await this.userService.getAllUsers(req.query as any);
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách user thành công',
        data: users,
        totalCount: totalCount,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
  };

  // [GET] /api/users/:id
  getOne = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const user = await this.userService.getUserById(id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
      }

      res.status(200).json({
        success: true,
        message: 'Lấy thông tin chi tiết user thành công',
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
    }
  };

  // [PUT] /api/users/:id
  update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const user = await this.userService.updateUser(id, req.body);

      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy user để sửa' });
      }
      res.status(200).json({ success: true, message: 'Cập nhật thành công', data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
    }
  };

  // delete = async (req: Request, res: Response) => {
  //   try {
  //     const id = req.params.id as string;
  //     const user = await this.userService.deleteUser(id);

  //     if (!user) {
  //       return res.status(404).json({ success: false, message: 'Không tìm thấy user để xóa' });
  //     }
  //     res.status(200).json({ success: true, message: 'Xóa thành công' });
  //   } catch (error: any) {
  //     res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
  //   }
  // };

  // [DELETE] /api/users/:id
  // delete = async (req: Request, res: Response) => {
  //   try {
  //     const id = req.params.id as string;
  //     const user = await this.userService.deleteUser(id);

  //     if (!user) {
  //       return res.status(404).json({ success: false, message: 'Không tìm thấy user để xóa' });
  //     }
  //     res.status(200).json({ success: true, message: 'Xóa thành công' });
  //   } catch (error: any) {
  //     res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
  //   }
  // };
  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this.userService.deleteUser(id as string);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.user,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  //[POST] /api/users/:id/password
  updatePassword = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { oldPassword, newPassword } = req.body;

      const user = await this.userService.updatePassword(id, { oldPassword, newPassword });

      res.status(200).json({
        success: true,
        message: 'Cập nhật mật khẩu thành công',
        data: user,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  //[GET] /api/users/staff
  getStaff = async (req: Request, res: Response) => {
    try {
      const { users, totalCount, allCount, activeCount, inactiveCount } = await this.userService.getStaff(
        req.query as any,
      );

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách nhân sự thành công',
        data: users,
        totalCount: totalCount,
        allCount,
        activeCount,
        inactiveCount,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  //[GET] /api/users/teachers
  getAllTeachers = async (req: Request, res: Response) => {
    try {
      const { teachers, totalCount, allCount, activeCount, inactiveCount } = await this.userService.getAllTeachers(
        req.query as any,
      );
      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách giáo viên thành công',
        data: teachers,
        totalCount,
        allCount,
        activeCount,
        inactiveCount,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  //[GET] /api/users/students
  getAllStudents = async (req: Request, res: Response) => {
    try {
      const { users, totalCount, summary } = await this.userService.getAllStudents(req.query as any);
      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách sinh viên thành công',
        data: users,
        totalCount,
        summary,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
}
