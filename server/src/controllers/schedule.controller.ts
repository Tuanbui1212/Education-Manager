import { Request, Response } from 'express';
import { ScheduleService } from '../services/schedule.service';
import { CreateScheduleType, ScheduleIdType, UpdateScheduleType } from '../validations/schedule.validation';
import { GetSchedulesQuery } from '../types/schedule.type';

export class ScheduleController {
  private scheduleService = new ScheduleService();

  create = async (req: Request<{}, {}, CreateScheduleType>, res: Response) => {
    try {
      const schedule = await this.scheduleService.createSchedule(req.body);
      return res.status(201).json({ success: true, message: 'Tạo lịch học thành công', data: schedule });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  getAll = async (req: Request<{}, {}, {}, GetSchedulesQuery>, res: Response) => {
    try {
      const { schedules, total } = await this.scheduleService.getAllSchedules(req.query);
      return res
        .status(200)
        .json({ success: true, message: 'Lấy danh sách lịch học thành công', data: schedules, totalCount: total });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  getOne = async (req: Request<ScheduleIdType>, res: Response) => {
    try {
      const schedule = await this.scheduleService.getScheduleById(req.params.id);
      return res.status(200).json({ success: true, message: 'Lấy lịch học thành công', data: schedule });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  update = async (req: Request<ScheduleIdType, {}, UpdateScheduleType>, res: Response) => {
    try {
      const schedule = await this.scheduleService.updateSchedule(req.params.id, req.body);
      return res.status(200).json({ success: true, message: 'Cập nhật lịch học thành công', data: schedule });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  delete = async (req: Request<ScheduleIdType>, res: Response) => {
    try {
      const schedule = await this.scheduleService.deleteSchedule(req.params.id);
      return res.status(200).json({ success: true, message: 'Xóa lịch học thành công', data: schedule });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  createBulk = async (req: Request<{}, {}, { schedules: CreateScheduleType[]; startDate: string }>, res: Response) => {
    try {
      const { schedules, startDate } = req.body;

      if (!schedules || schedules.length === 0) {
        return res.status(400).json({ success: false, message: 'Danh sách lịch học trống' });
      }

      const results = await this.scheduleService.createSchedulesBulk(schedules, startDate);

      return res.status(201).json({
        success: true,
        message: `Đã tạo thành công ${results.length} buổi học`,
        data: results,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  deleteBulk = async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách ID cần xóa' });
      }

      const result = await this.scheduleService.deleteSchedulesBulk(ids);

      return res.status(200).json({
        success: true,
        message: `Đã xóa thành công ${result.deletedCount} buổi học`,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  //[GET] /schedules/class/:classId/start-date
  getStartDateClass = async (req: Request<{ classId: string }>, res: Response) => {
    try {
      const startDate = await this.scheduleService.getStartDateClass({ _id: req.params.classId });
      return res.status(200).json({ success: true, message: 'Lấy ngày bắt đầu lớp học thành công', data: startDate });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  //[GET] /schedules/class/today
  getTodaySchedules = async (req: Request, res: Response) => {
    try {
      const schedules = await this.scheduleService.getTodaySchedules();
      return res
        .status(200)
        .json({ success: true, message: 'Lấy danh sách lịch học hôm nay thành công', data: schedules });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  //[POST] /schedule/class/createScheduleForAllClassRequest
  createScheduleForAllClassRequest = async (req: Request, res: Response) => {
    try {
      const creatorId = (req as any).user?._id || (req as any).user?.id;

      const schedules = await this.scheduleService.createScheduleForAllClassRequest(creatorId);
      return res.status(200).json({
        success: true,
        message: 'Tạo lịch học cho tất cả lớp thành công',
        data: schedules,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
}
