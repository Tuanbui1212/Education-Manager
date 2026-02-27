import { Request, Response } from 'express';
import { ShiftService } from '../services/shift.service';

export class ShiftController {
  private shiftService = new ShiftService();

  // [POST] /api/shifts
  create = async (req: Request, res: Response) => {
    try {
      const shift = await this.shiftService.createShift(req.body);
      res.status(201).json({ success: true, message: 'Tạo ca thành công', data: shift });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [GET] /api/shifts
  getAll = async (req: Request, res: Response) => {
    try {
      const shifts = await this.shiftService.getAllShifts();
      res.status(200).json({ success: true, data: shifts });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };

  // [GET] /api/shifts/:id
  getOne = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const shift = await this.shiftService.getShiftById(id);

      if (!shift) return res.status(404).json({ success: false, message: 'Không tìm thấy ca học' });
      res.status(200).json({ success: true, data: shift });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };

  //[PUT] /api/shifts/:id
  update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const shift = await this.shiftService.updateShift(id, req.body);

      if (!shift) return res.status(404).json({ success: false, message: 'Không tìm thấy ca học để sửa' });
      res.status(200).json({ success: true, message: 'Cập nhật thành công', data: shift });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };

  //[DELETE] /api/shifts/:id
  delete = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const shift = await this.shiftService.deleteShift(id);

      if (!shift) return res.status(404).json({ success: false, message: 'Không tìm thấy ca học để xóa' });
      res.status(200).json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
}
