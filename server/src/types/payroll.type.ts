import { Document, Types } from 'mongoose';

export enum PayrollType {
  STAFF = 'STAFF',
  TEACHER_FULL_TIME = 'TEACHER_FULL_TIME',
  TEACHER_PART_TIME = 'TEACHER_PART_TIME',
}

export enum PayrollStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export interface IPayroll extends Document {
  userId: Types.ObjectId;
  month: string;
  roleName: string;
  payrollType: PayrollType;
  baseSalary: number;
  hourlyRate: number;
  metrics: {
    standardDays?: number;
    actualDays?: number;
    standardHours?: number;
    teachingHours?: number;
  };
  allowance: number;
  deduction: number;
  totalSalary: number;
  status: PayrollStatus;
  bankInfo?: {
    bankName: string;
    bankBin: string;
    accountNo: string;
    accountName: string;
  };
  isEmailSent: boolean;
  emailSentAt?: string;
  createdAt: Date;
  updatedAt: Date;
}
