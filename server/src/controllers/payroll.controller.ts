import { Request, Response } from 'express';
import payrollService from '../services/payroll.service';

export class PayrollController {
  // [POST] /api/payrolls
  async create(req: Request, res: Response) {
    try {
      const payroll = await payrollService.createPayroll(req.body);
      return res.status(201).json({ success: true, data: payroll });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Bảng lương của nhân viên trong tháng này đã tồn tại' });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/payrolls
  async getAll(req: Request, res: Response) {
    try {
      const { month } = req.query;
      const payrolls = await payrollService.getAllPayrolls(month as string);
      return res.status(200).json({ success: true, message: 'Lấy danh sách bảng lương thành công', data: payrolls });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/payrolls/:id
  async getById(req: Request, res: Response) {
    try {
      const payroll = await payrollService.getPayrollById(req.params.id as string);
      if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });
      return res.status(200).json({ success: true, message: 'Lấy bảng lương thành công', data: payroll });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // [PUT] /api/payrolls/:id
  async update(req: Request, res: Response) {
    try {
      const payroll = await payrollService.updatePayroll(req.params.id as string, req.body);
      if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });
      return res.status(200).json({ success: true, message: 'Cập nhật bảng lương thành công', data: payroll });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // [DELETE] /api/payrolls/:id
  async delete(req: Request, res: Response) {
    try {
      const payroll = await payrollService.deletePayroll(req.params.id as string);
      if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });
      return res.status(200).json({ success: true, message: 'Xóa bảng lương thành công' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  //[POST] /payrolls/generate
  async generateForMonth(req: Request, res: Response) {
    try {
      const { month } = req.body;
      const { success, count, data } = await payrollService.generatePayrollForMonth(month as string);
      return res.status(200).json({ success, message: `Tính lương cho tháng ${month} thành công`, count, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /payrolls/send-email
  async sendPayrollEmail(req: Request, res: Response) {
    try {
      const { payrollIds } = req.body;
      const { successCount, failedCount } = await payrollService.sendPayrollEmail(payrollIds);
      return res.status(200).json({
        success: true,
        message: `Gửi email thông báo lương thành công cho ${successCount} bảng lương, thất bại ${failedCount} bảng lương`,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /payrolls/mark-paid
  async markAsPaid(req: Request, res: Response) {
    try {
      const { payrollIds } = req.body;
      const { count, data } = await payrollService.markPayrollAsPaid(payrollIds);
      return res.status(200).json({ success: true, message: `Đã đánh dấu ${count} bảng lương là đã thanh toán`, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/payrolls/export
  async exportExcel(req: Request, res: Response) {
    try {
      const { month } = req.query;

      if (!month || typeof month !== 'string') {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tháng cần xuất' });
      }

      const buffer = await payrollService.exportPayrollToExcel(month);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Bang_Luong_Thang_${month}.xlsx`);

      return res.send(buffer);
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new PayrollController();
