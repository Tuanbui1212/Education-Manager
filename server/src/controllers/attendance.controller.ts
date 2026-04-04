import { Request, Response } from "express";
import { AttendanceService } from "../services/attendance.service";

export class AttendanceController {
    private attendanceService = new AttendanceService();

    getAllClasses = async (req: Request, res: Response) => {
        try {
            const result = await this.attendanceService.getAllClasses(req.query, (req as any).user?.id);
            return res.status(200).json({ success: true, message: "Lấy danh sách lớp học thành công", ...result });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    getAllAttendancesByClassId = async (req: Request, res: Response) => {
        try {
            const result = await this.attendanceService.getAllAttendancesByClassId(req.params.classId as string, req.query);
            return res.status(200).json({ success: true, message: "Lấy danh sách điểm danh thành công", ...result });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    getListAttendanceByClassId = async (req: Request, res: Response) => {
        try {
            const result = await this.attendanceService.getListAttendanceByClassId(req.params.classId as string, req.params.scheduleId as string, req.query);
            return res.status(200).json({ success: true, message: "Lấy danh sách điểm danh thành công", ...result });
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

    getStudentAttendancesByClassId = async (req: Request, res: Response) => {
        try {
            const studentId = (req as any).user?.id;
            const result = await this.attendanceService.getStudentAttendancesByClassId(req.params.classId as string, studentId);
            return res.status(200).json({ success: true, message: "Lấy danh sách điểm danh thành công", ...result });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
