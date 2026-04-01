import { Document, Types } from 'mongoose';
import { IRole } from './role.type';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  RESERVED = 'RESERVED',
  POTENTIAL = 'POTENTIAL',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum TeacherType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
}

export interface IBankInfo {
  bankName: string;
  bankBin: string;
  accountNo: string;
  accountName: string;
}

export interface IStudentInfo {
  parentsName?: string;
  crmHistory?: string[];
  consultantId?: Types.ObjectId | string;
}

export interface ITeacherInfo {
  type?: TeacherType;
  hourlyRate?: number;
}

export interface IUser extends Document {
  email: string;
  phone: string;
  gender: Gender;
  password?: string;
  fullName: string;
  roleId: Types.ObjectId | IRole;
  date: Date;
  status: UserStatus;
  degrees?: string[];
  certificates?: string[];
  baseSalary?: number;
  bankInfo?: IBankInfo;
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
