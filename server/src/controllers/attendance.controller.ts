import { Request, Response } from "express";
import { AttendanceService } from "../services/attendance.service";

export class AttendanceController {
    private attendanceService = new AttendanceService();

    getAll = async (req: Request, res: Response) => {
        try {
            const result = await this.attendanceService.getAll(req.query);
            return res.status(200).json({ success: true, message: "Lấy thống kê điểm danh thành công", ...result });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    getById = async (req: Request, res: Response) => {
        try {
            const result = await this.attendanceService.getById(req.params.scheduleId as string);
            return res.status(200).json({ success: true, message: "Lấy danh sách điểm danh thành công", data: result });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    upsert = async (req: Request, res: Response) => {
        try {
            const result = await this.attendanceService.upsert(req.body);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
