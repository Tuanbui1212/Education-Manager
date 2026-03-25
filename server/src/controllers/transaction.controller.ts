import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';

export class TransactionController {
  private transactionService = new TransactionService();

  createTransaction = async (req: Request, res: Response) => {
    try {
      const processedBy = req.body.processedBy || (req as any).user?._id;

      if (!processedBy) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy ID người thu tiền. Hãy đảm bảo bạn đã đăng nhập hoặc Frontend đã gửi processedBy.',
        });
      }

      const result = await this.transactionService.processPayment(req.body, processedBy);

      res.status(201).json({
        success: true,
        message: 'Tạo phiếu thu thành công',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  getTransactions = async (req: Request, res: Response) => {
    try {
      const result = await this.transactionService.getTransactions(req.query);

      res.status(200).json({
        success: true,
        data: result.transactions,
        total: result.total,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
