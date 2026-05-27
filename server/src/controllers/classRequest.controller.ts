import { Request, Response } from 'express';
import { ClassRequestService } from '../services/classRequest.service';
import { GeneticAlgorithmService } from '../services/geneticAlgorithm.service';

export class ClassRequestController {
  private classRequestService = new ClassRequestService();
  private geneticAlgorithmService = new GeneticAlgorithmService();

  // [POST] /api/classRequests
  create = async (req: Request, res: Response) => {
    try {
      const creatorId = (req as any).user?._id || (req as any).user?.id;
      const { idClassRequests } = req.body;

      const response = await this.classRequestService.createClassRequest(idClassRequests, creatorId);
      res.status(201).json({ success: true, message: 'Tạo yêu cầu thành công', data: response });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [GET] /api/classRequests
  getAll = async (req: Request, res: Response) => {
    try {
      const creatorId = (req as any).user?._id || (req as any).user?.id;

      const classRequests = await this.classRequestService.getAllClassRequests(creatorId);
      res.status(200).json({ success: true, data: classRequests });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  //[GET] /api/classRequests/:id
  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const response = await this.classRequestService.getClassRequestById(id as string);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [DELETE] /api/classRequests
  deleteByCreatorId = async (req: Request, res: Response) => {
    try {
      const creatorId = (req as any).user?._id || (req as any).user?.id;

      await this.classRequestService.deleteAllClassRequestById(creatorId);
      res.status(200).json({ success: true, message: 'Xóa yêu cầu thành công' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [PUT] /api/classRequests/:id
  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const response = await this.classRequestService.updateClassRequest(id as string, req.body);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // [POST] /api/classRequests/runGA
  runGA = async (req: Request, res: Response) => {
    try {
      const creatorId = (req as any).user?._id || (req as any).user?.id;

      console.log('Dữ liệu đầu vào cho GA:', { creatorId });

      const gaResult = await this.geneticAlgorithmService.runGA(creatorId);

      // console.log('GA Response sample:', JSON.stringify(gaResult, null, 2));
      console.log('Total genes:', gaResult.length);

      res.status(200).json({ success: true, data: gaResult, message: 'Tạo lịch thành công' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
