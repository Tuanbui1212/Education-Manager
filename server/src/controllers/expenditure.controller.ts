import { Request, Response } from 'express';
import { ExpenditureService } from '../services/expenditure.service';
import { UserService } from '../services/user.service';

export class ExpenditureController {
  private expenditureService = new ExpenditureService();
  private userService = new UserService();

  // [POST] /api/expenditure
  create = async (req: Request, res: Response) => {
    try {
      const receiver = await this.userService.getUserById(req.body.receiverId);
      if (!receiver) {
        return res.status(404).json({ success: false, message: 'Người nhận không tồn tại' });
      }

      const result = await this.expenditureService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo khoản chi thành công',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [GET] /api/expenditure
  getAll = async (req: Request, res: Response) => {
    try {
      const result = await this.expenditureService.getAll();
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  };

  // [UPDATE] /api/expenditure
  update = async (req: Request, res: Response) => {
    try {
      const receiver = await this.userService.getUserById(req.body.receiverId);
      if (!receiver) {
        return res.status(404).json({ success: false, message: 'Người nhận không tồn tại' });
      }

      const result = await this.expenditureService.update(req.params.id as string, req.body);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khoản chi' });
      }
      res.json({ success: true, message: 'Cập nhật thành công', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [DELETE] /api/expenditure
  delete = async (req: Request, res: Response) => {
    try {
      const result = await this.expenditureService.delete(req.params.id as string);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khoản chi' });
      }
      res.json({ success: true, message: 'Xóa khoản chi thành công' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
