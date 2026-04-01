export type PayrollType = 'STAFF' | 'TEACHER_FULL_TIME' | 'TEACHER_PART_TIME';
export type PayrollStatus = 'PENDING' | 'PAID';

export interface IPayroll {
  _id: string;
  userId: IUser;
  month: string;
  roleName: string;
  payrollType: PayrollType;
  baseSalary: number;
  hourlyRate: number;
  metrics: {
    standardDays: number;
    actualDays: number;
    teachingHours: number;
    standardHours: number;
  };
  allowance: number;
  deduction: number;
  totalSalary: number;
  status: PayrollStatus | string;
  bankInfo?: {
    bankName: string;
    bankBin: string;
    accountNo: string;
    accountName: string;
  };
  isEmailSent: boolean;
  emailSentAt?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IUser {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
}
