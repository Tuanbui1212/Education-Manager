import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  SALE = 'SALE',
  TEACHING_ASSISTANT = 'TEACHING_ASSISTANT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface IStudentInfo {
  parentsName?: string;
  crmHistory?: string[];
  consultantId?: string;
}

export interface ITeacherInfo {
  hourlyRate?: number;
  degrees?: string[];
}

export interface IUser extends Document {
  email: string;
  phone: string;
  password?: string;
  fullName: string;
  role: UserRole;
  date: Date;
  status: UserStatus;
  student_info?: IStudentInfo;
  teacher_info?: ITeacherInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
}
