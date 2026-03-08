import { Request, Response } from 'express';
import { FixedCostService } from '../services/fixedCost.service';

export class FixedCostController {
  private fixedCostService = new FixedCostService();

  // [POST] /api/fixed-costs
  create = async (req: Request, res: Response) => {
    try {
      const result = await this.fixedCostService.createFixedCost(req.body);
      res.status(201).json({ success: true, message: 'Tạo chi phí thành công', data: result });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };

  // [GET] /api/fixed-costs
  getAll = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { items, total } = await this.fixedCostService.getAllFixedCosts(limit, page);
      res
        .status(200)
        .json({ success: true, message: 'Lấy danh sách chi phí thành công', data: items, totalCount: total });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };

  // [GET] /api/fixed-costs/:id
  getById = async (req: Request, res: Response) => {
    try {
      const result = await this.fixedCostService.getFixedCostById(req.params.id as string);
      if (!result) return res.status(404).json({ status: 'error', message: 'Không tìm thấy chi phí' });
      res.status(200).json({ success: true, message: 'Lấy chi phí thành công', data: result });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };

  // [PUT] /api/fixed-costs/:id
  update = async (req: Request, res: Response) => {
    try {
      const result = await this.fixedCostService.updateFixedCost(req.params.id as string, req.body);
      if (!result) return res.status(404).json({ status: 'error', message: 'Không tìm thấy chi phí' });
      res.status(200).json({ success: true, message: 'Cập nhật thành công', data: result });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };

  // [DELETE] /api/fixed-costs/:id
  remove = async (req: Request, res: Response) => {
    try {
      const result = await this.fixedCostService.deleteFixedCost(req.params.id as string);
      if (!result) return res.status(404).json({ status: 'error', message: 'Không tìm thấy chi phí' });
      res.status(200).json({ success: true, message: 'Xóa thành công' });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };
}
