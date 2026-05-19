import { Document, Types } from "mongoose";

export enum AttendanceNotificationType {
    ATTENDANCE = 'ATTENDANCE',
    EXAM = 'EXAM',
}

export interface IAttendanceNotification extends Document {
    userId: Types.ObjectId;
    title: string;
    content: string;
    attendanceId?: Types.ObjectId;
    examId?: Types.ObjectId;
    isRead: boolean;
    type: AttendanceNotificationType;
}

export interface GetAttendanceNotificationsQuery {
    page?: number;
    limit?: number;
    isRead?: boolean;
}