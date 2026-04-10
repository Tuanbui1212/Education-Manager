import { Document, Types } from "mongoose";

export interface IAttendanceNotification extends Document {
    userId: Types.ObjectId;
    title: string;
    content: string;
    attendanceId: Types.ObjectId;
    isRead: boolean;
}

export interface GetAttendanceNotificationsQuery {
    page?: number;
    limit?: number;
    isRead?: boolean;
}