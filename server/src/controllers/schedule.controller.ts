import { Request, Response } from "express";
import { ScheduleService } from "../services/schedule.service";
import { CreateScheduleType, ScheduleIdType, UpdateScheduleType } from "../validations/schedule.validation";
import { GetSchedulesQuery } from "../types/schedule.type";

export class ScheduleController {
    private scheduleService = new ScheduleService();

    create = async (req: Request<{}, {}, CreateScheduleType>, res: Response) => {
        try {
            const schedule = await this.scheduleService.createSchedule(req.body);
            return res.status(201).json({ success: true, message: "Tạo lịch học thành công", data: schedule });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    getAll = async (req: Request<{}, {}, {}, GetSchedulesQuery>, res: Response) => {
        try {
            const { schedules, total } = await this.scheduleService.getAllSchedules(req.query);
            return res.status(200).json({ success: true, message: "Lấy danh sách lịch học thành công", data: schedules, totalCount: total });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    getOne = async (req: Request<ScheduleIdType>, res: Response) => {
        try {
            const schedule = await this.scheduleService.getScheduleById(req.params.id);
            return res.status(200).json({ success: true, message: "Lấy lịch học thành công", data: schedule });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    update = async (req: Request<ScheduleIdType, {}, UpdateScheduleType>, res: Response) => {
        try {
            const schedule = await this.scheduleService.updateSchedule(req.params.id, req.body);
            return res.status(200).json({ success: true, message: "Cập nhật lịch học thành công", data: schedule });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    delete = async (req: Request<ScheduleIdType>, res: Response) => {
        try {
            const schedule = await this.scheduleService.deleteSchedule(req.params.id);
            return res.status(200).json({ success: true, message: "Xóa lịch học thành công", data: schedule });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}