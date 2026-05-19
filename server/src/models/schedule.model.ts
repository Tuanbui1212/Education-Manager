import { Schema, model } from "mongoose";
import { ISchedule } from "../types/schedule.type";

const ScheduleSchema = new Schema<ISchedule>(
    {
        classId: { type: Schema.Types.ObjectId, ref: "Class", required: [true, "Lớp học là bắt buộc"] },
        shiftId: { type: Schema.Types.ObjectId, ref: "Shift", required: [true, "Ca học là bắt buộc"] },
        roomId: { type: Schema.Types.ObjectId, ref: "Room", optional: true },
        teacherId: { type: Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, required: [true, "Ngày học là bắt buộc"] },
        attendances: { type: [Schema.Types.ObjectId], ref: "User" },
    },
    { timestamps: true }
);

export const ScheduleModel = model<ISchedule>("Schedule", ScheduleSchema);