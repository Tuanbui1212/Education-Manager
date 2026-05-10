import type { IClass } from './class.type';
import type { IShift } from './shift.type';
import type { IRoom } from './room.type';
import type { IUser } from './user.type';

export interface ISchedule {
  _id?: string;
  classId: string | IClass;
  shiftId: string | IShift;
  roomId: string | IRoom;
  teacherId?: string | IUser;
  date: string | Date;
  attendances?: (string | IUser)[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GetSchedulesParams {
  page?: number;
  limit?: number;
  classId?: string;
  roomId?: string;
  teacherId?: string;
  search?: string;
  date?: string;
}

export interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ISchedule>) => void;
  initialData?: ISchedule;
}

export interface BulkScheduleItem {
  classId: string;
  shiftId: string;
  roomId: string;
  teacherId: string;
  date: Date | string;
}

export type ScheduleStatus = 'ongoing' | 'upcoming' | 'done';
