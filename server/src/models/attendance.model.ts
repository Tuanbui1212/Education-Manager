import mongoose, { Schema } from "mongoose";
import { AttendanceStatus, HomeworkStatus, IAttendance } from "../types/attendance.type";

const AttendanceSchema = new Schema<IAttendance>(
    {
        scheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule', required: true },
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
        homework: { type: String, required: true, enum: HomeworkStatus },
        teacherComment: { type: String, required: true },
        mark: { type: Number, required: false },
        status: { type: String, required: true, enum: AttendanceStatus },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const AttendanceModel = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
