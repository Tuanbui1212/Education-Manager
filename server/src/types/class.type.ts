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
  roomId?: Types.ObjectId;
  documents: Array<string>;
  studentIds: Array<Types.ObjectId>;
  startDate?: Date;
  status: ClassStatus;
  totalLessons: number;
  maxNumberOfStudents: number;
  lessonsPerWeek: number;
  optionalRequirements?: string[];
  schedule: boolean;
}

export interface GetClassesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClassStatus;
  courseId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface GetStudentsByClassQuery {
  page?: number;
  limit?: number;
  search?: string;
}
