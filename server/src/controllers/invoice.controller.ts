import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoice.service';

export class InvoiceController {
  private invoiceService = new InvoiceService();

  // [POST] /api/invoices
  create = async (req: Request, res: Response) => {
    try {
      const invoice = await this.invoiceService.createInvoice(req.body);
      return res.status(201).json({ success: true, message: 'Tạo hóa đơn thành công', data: invoice });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  // [GET] /api/invoices
  getAll = async (req: Request, res: Response) => {
    try {
      const { invoices, total } = await this.invoiceService.getInvoices(req.query);
      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách hóa đơn thành công',
        data: invoices,
        totalCount: total,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  // [GET] /api/invoices/student/:studentId
  getByStudentId = async (req: Request, res: Response) => {
    try {
      const { invoices, total } = await this.invoiceService.getInvoicesByStudentId(
        req.params.studentId as string,
        req.query,
      );
      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách hóa đơn thành công',
        data: invoices,
        totalCount: total,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  // [GET] /api/invoices/:id
  getOne = async (req: Request, res: Response) => {
    try {
      const invoice = await this.invoiceService.getInvoiceById(req.params.id as string);
      return res.status(200).json({ success: true, message: 'Lấy hóa đơn thành công', data: invoice });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  };

  // [PUT] /api/invoices/:id
  update = async (req: Request, res: Response) => {
    try {
      const invoice = await this.invoiceService.updateInvoice(req.params.id as string, req.body);
      return res.status(200).json({ success: true, message: 'Cập nhật hóa đơn thành công', data: invoice });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  // [DELETE] /api/invoices/:id
  delete = async (req: Request, res: Response) => {
    try {
      const invoice = await this.invoiceService.deleteInvoice(req.params.id as string);
      return res.status(200).json({ success: true, message: 'Xóa hóa đơn thành công', data: invoice });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  // [PUT] /api/invoices/:id/installment
  setupInstallment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { totalMonths } = req.body;

      if (!totalMonths || totalMonths < 2) {
        return res.status(400).json({ success: false, message: 'Số kỳ trả góp tối thiểu là 2' });
      }

      const invoice = await this.invoiceService.setupInstallment(id as string, { totalMonths });

      res.status(200).json({
        success: true,
        message: 'Thiết lập trả góp thành công',
        data: invoice,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [PATH] /api/invoices/:id/notify
  markAsNotified = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { isInstallment } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu ID hóa đơn',
        });
      }

      const result = await this.invoiceService.markAsNotified(id as string, !!isInstallment);

      res.status(200).json({
        success: true,
        message: 'Đã cập nhật trạng thái nhắc nợ thành công',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  //[POST] /api/invoices/cancelInvoice
  cancelInvoice = async (req: Request, res: Response) => {
    try {
      const { invoiceId } = req.body;
      const invoice = await this.invoiceService.cancelInvoice(invoiceId);
      res.status(200).json({ success: true, message: 'Hủy học phí thành công', data: invoice });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  //[POST] /api/invoices/refundInvoice
  refundInvoice = async (req: Request, res: Response) => {
    try {
      const { invoiceId } = req.body;
      const currentUserId = (req as any).user?._id || (req as any).user?.id;
      const invoice = await this.invoiceService.refundInvoice(invoiceId, currentUserId);
      res.status(200).json({ success: true, message: 'Hoàn học phí thành công', data: invoice });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
