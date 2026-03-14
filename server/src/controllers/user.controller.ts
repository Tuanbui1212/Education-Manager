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

      if (result.action === 'SOFT_DELETE') {
        return res.status(200).json({
          success: true,
          message:
            'Giáo viên này đã có dữ liệu lớp học. Hệ thống đã chuyển sang trạng thái "Ngừng hoạt động" để bảo toàn lịch sử.',
          data: result.user,
        });
      }

      // Nếu là HARD_DELETE
      return res.status(200).json({
        success: true,
        message: 'Xóa giáo viên thành công (Xóa vĩnh viễn khỏi cơ sở dữ liệu).',
        data: result.user,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
}
