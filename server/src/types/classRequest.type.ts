import { Types } from 'mongoose';
import { ISchedule } from './schedule.type';
import { IRoom } from './room.type';
import { IShift } from './shift.type';

export interface IClassRequest {
  creatorId: Types.ObjectId;
  name: string;
  courseId: Types.ObjectId;
  teacherId: Types.ObjectId;
  roomId?: Types.ObjectId;
  startDate?: Date;
  totalLessons: number;
  maxNumberOfStudents: number;
  lessonsPerWeek: number;
  optionalRequirements?: string[];
  schedule?: any;
}

export interface Gene {
  classRequestId: string;
  teacherId: string;
  dayOfWeek: number;
  shiftId: string;
  roomId: string;
}

export interface GAInputData {
  requests: IClassRequest[];
  rooms: IRoom[];
  shifts: IShift[];
  existingSchedules: ISchedule[];
}

export interface GAInput {
  classes: any[];
  rooms: any[];
  shifts: any[];
  busySlots: Set<string>;
}

export interface IGene {
  classRequestId: string;
  teacherId: string;
  dayOfWeek: number;
  shiftId: string;
  roomId: string;
}

interface IScheduleItem {
  day: number;
  shiftId: Types.ObjectId;
  roomId: Types.ObjectId;
  slotScore: number;
}
