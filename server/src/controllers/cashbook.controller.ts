import { Request, Response } from 'express';
import { CashBookService } from '../services/cashbook.service';

export class CashBookController {
  private cashBookService = new CashBookService();

  // [GET] /api/cashbook
  getCashBook = async (req: Request, res: Response) => {
    try {
      const { data, total, summary } = await this.cashBookService.getCashBook(req.query);
      res.status(200).json({ success: true, message: 'Lấy bảng thu chi thành công', data, totalCount: total, summary });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  //[GET] /api/cashbook/:id
  getCashBookById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this.cashBookService.getCashBookById(
        id as string,
        req.query.type as string,
        req.query.table as string,
      );
      res.status(200).json({ success: true, message: 'Lấy bảng thu chi thành công', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
