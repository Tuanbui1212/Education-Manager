// src/types/user.type.ts
import { Document } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  SALE = "SALE",
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
  student_info?: IStudentInfo;
  teacher_info?: ITeacherInfo;
  createdAt: Date;
  updatedAt: Date;
}
