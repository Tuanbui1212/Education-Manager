import { Document, Types } from "mongoose";

export interface ISchedule extends Document {
    classId: Types.ObjectId;
    shiftId: Types.ObjectId;
    roomId: Types.ObjectId;
    teacherId?: Types.ObjectId;
    date: Date;
    attendances?: Types.ObjectId[];
}

export interface GetSchedulesQuery {
    page?: number;
    limit?: number;
    classId?: string;
    roomId?: string;
    teacherId?: string;
}