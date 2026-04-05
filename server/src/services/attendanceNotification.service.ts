import { AttendanceNotificationModel } from "../models/attendanceNotification.model";
import { Types } from "mongoose";

export class AttendanceNotificationService {
    async getNotifications(userId: string, query: any) {
        const { page = 1, limit = 10, isRead } = query;
        const match: any = { userId: new Types.ObjectId(userId) };

        if (isRead !== undefined) {
            match.isRead = isRead === 'true' || isRead === true;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [data, totalCount, unreadCount] = await Promise.all([
            AttendanceNotificationModel.find(match)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate({ path: 'attendanceId', select: 'classId' }),
            AttendanceNotificationModel.countDocuments(match),
            AttendanceNotificationModel.countDocuments({ userId: new Types.ObjectId(userId), isRead: false })
        ]);

        return { data, totalCount, unreadCount };

    }

    async markAsRead(id: string, userId: string) {
        const notification = await AttendanceNotificationModel.findOneAndUpdate(
            { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            throw new Error("Không tìm thấy thông báo");
        }
        return notification;
    }

    async markAllAsRead(userId: string) {
        await AttendanceNotificationModel.updateMany(
            { userId: new Types.ObjectId(userId), isRead: false },
            { isRead: true }
        );
        return { success: true };
    }

    async deleteAllRead(userId: string) {
        await AttendanceNotificationModel.deleteMany(
            { userId: new Types.ObjectId(userId), isRead: true }
        );
        return { success: true };
    }
}
