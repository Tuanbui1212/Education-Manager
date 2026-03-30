import mongoose, { Schema } from "mongoose";
import { IAttendanceNotification } from "../types/attendanceNotification.type";

const AttendanceNotificationSchema = new Schema<IAttendanceNotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        attendanceId: { type: Schema.Types.ObjectId, ref: 'Attendance' },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

export const AttendanceNotificationModel = mongoose.model('AttendanceNotification', AttendanceNotificationSchema);