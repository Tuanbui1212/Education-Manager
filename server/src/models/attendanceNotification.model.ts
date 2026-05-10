import mongoose, { Schema } from "mongoose";
import { AttendanceNotificationType, IAttendanceNotification } from "../types/attendanceNotification.type";

const AttendanceNotificationSchema = new Schema<IAttendanceNotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        attendanceId: { type: Schema.Types.ObjectId, ref: 'Attendance' },
        examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
        isRead: { type: Boolean, default: false },
        type: { type: String, enum: Object.values(AttendanceNotificationType), default: AttendanceNotificationType.ATTENDANCE },
    },
    { timestamps: true, versionKey: false }
);

export const AttendanceNotificationModel = mongoose.model('AttendanceNotification', AttendanceNotificationSchema);