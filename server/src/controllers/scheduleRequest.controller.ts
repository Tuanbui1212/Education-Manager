import { Request, Response } from 'express';
import { ScheduleRequestService } from '../services/scheduleRequest.service';

export class ScheduleRequestController {
  private scheduleRequestService = new ScheduleRequestService();

  init = async (req: Request, res: Response) => {
    try {
      const { classIds } = req.body;

      const response = await this.scheduleRequestService.initRequest(classIds);

      return res.status(201).json({
        success: true,
        message: 'Khởi tạo phiên xếp lịch thành công',
        data: response,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi khởi tạo yêu cầu',
        error: error.message,
      });
    }
  };

  updatePreference = async (req: Request, res: Response) => {
    try {
      const { requestId, classId, prefs } = req.body;

      const response = await this.scheduleRequestService.updateClassPreference(requestId, classId, prefs);

      if (!response) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phiên xếp lịch hoặc lớp học tương ứng',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cập nhật tùy chọn thành công',
        data: response,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật tùy chọn',
        error: error.message,
      });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;

      const response = await this.scheduleRequestService.getRequestById(requestId as string);

      if (!response) {
        return res.status(404).json({
          success: false,
          message: 'Phiên xếp lịch không tồn tại hoặc đã bị xóa',
        });
      }

      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi tải dữ liệu',
        error: error.message,
      });
    }
  };

  cancelRequest = async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;

      const response = await this.scheduleRequestService.cancelRequest(requestId as string);

      if (!response) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phiên cần hủy',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Đã hủy phiên xếp lịch và dọn dẹp dữ liệu',
        data: response,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi hủy yêu cầu',
        error: error.message,
      });
    }
  };
}
