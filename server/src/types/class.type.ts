import { Types } from 'mongoose';

export enum ClassStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  MAINTENANCE = 'MAINTENANCE',
  PENDING = 'PENDING',
}

export interface IClass {
  name: string;
  courseId: Types.ObjectId;
  teacherId: Types.ObjectId;
  roomId: Types.ObjectId;
  documents: Array<string>;
  studentIds: Array<Types.ObjectId>;
  startDate?: Date;
  status: ClassStatus;
}

export interface GetClassesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClassStatus;
}

export interface GetStudentsByClassQuery {
  page?: number;
  limit?: number;
  search?: string;
}
