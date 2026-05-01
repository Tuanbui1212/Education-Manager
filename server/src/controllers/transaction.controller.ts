import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';

export class TransactionController {
  private transactionService = new TransactionService();

  //[POST] api/transactions/
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

  //[POST] api/transactions/create
  createTransactionTest = async (req: Request, res: Response) => {
    try {
      const currentUserId = (req as any).user?._id || (req as any).user?.id;
      const result = await this.transactionService.createTransaction(req.body, currentUserId);

      return res.status(201).json({
        success: true,
        message: 'Tạo phiếu thu thành công',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [GET] api/transactions
  getTransactions = async (req: Request, res: Response) => {
    try {
      const result = await this.transactionService.getTransactions(req.query);

      res.status(200).json({
        success: true,
        data: result.transactions,
        total: result.total,
        summary: result.summary,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  //[GET] api/transactions/:id
  getTransactionById = async (req: Request, res: Response) => {
    console.log(req.params.id);

    try {
      const result = await this.transactionService.getTransactionsById(req.params.id as string);
      res.status(200).json({
        success: true,
        message: 'Lấy thông tin phiếu thu thành công',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
