import { Document, Types } from 'mongoose';

export interface ISchedule extends Document {
  classId: Types.ObjectId;
  shiftId: Types.ObjectId | shiftInfo;
  roomId: Types.ObjectId;
  teacherId?: Types.ObjectId;
  date: Date;
  attendances?: Types.ObjectId[];
}

export interface shiftInfo {
  _id?: Types.ObjectId;
  name?: string;
  startTime?: string;
  endTime?: string;
}

export interface GetSchedulesQuery {
  page?: number;
  limit?: number;
  classId?: string;
  roomId?: string;
  teacherId?: string;
}

export interface ScheduleStatus {
  ongoing: string;
  upcoming: string;
  done: string;
}
