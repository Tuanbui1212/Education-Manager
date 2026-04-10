import { Request, Response } from "express";
import { AttendanceNotificationService } from "../services/attendanceNotification.service";

export class AttendanceNotificationController {
    private service = new AttendanceNotificationService();

    getNotifications = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const result = await this.service.getNotifications(userId, req.query);
            return res.status(200).json({ success: true, ...result });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    markAsRead = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const id = req.params.id as string;
            const result = await this.service.markAsRead(id, userId);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    markAllAsRead = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const result = await this.service.markAllAsRead(userId);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    deleteAllRead = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const result = await this.service.deleteAllRead(userId);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
