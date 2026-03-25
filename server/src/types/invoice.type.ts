import { Types } from 'mongoose';

export enum InvoiceStatus {
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  UNPAID = 'UNPAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  OVERDUE = 'OVERDUE',
}

export interface IInstallmentConfig {
  totalMonths: number;
  amountPerMonth: number;
}

export interface IInvoice {
  _id?: Types.ObjectId | string;
  code: string;
  studentId: Types.ObjectId | string;
  classId: Types.ObjectId | string;
  consultantId?: Types.ObjectId | string;

  finalAmount: number;
  debt: number;
  status: InvoiceStatus;

  installmentConfig?: IInstallmentConfig;
  dueDate?: Date;
  remindCount?: number;
  lastRemindedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateInvoiceType {
  studentId: Types.ObjectId | string;
  classId: Types.ObjectId | string;
  consultantId?: Types.ObjectId | string;
  finalAmount: number;
  dueDate?: Date | string;
}

export interface UpdateInvoiceType extends Partial<CreateInvoiceType> {
  status?: InvoiceStatus;
  dueDate?: Date | string;
}
