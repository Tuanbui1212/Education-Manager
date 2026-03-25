import { Document, Types } from 'mongoose';
import { IRole } from './role.type';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  RESERVED = 'RESERVED',
  POTENTIAL = 'POTENTIAL',
}

export interface IStudentInfo {
  parentsName?: string;
  crmHistory?: string[];
  consultantId?: Types.ObjectId | string;
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
  roleId: Types.ObjectId | IRole;
  date: Date;
  status: UserStatus;
  student_info?: IStudentInfo;
  teacher_info?: ITeacherInfo;
  createdAt: Date;
  updatedAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  status?: string;
}
