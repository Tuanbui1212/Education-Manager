import { Types } from 'mongoose';

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD',
  VNPAY = 'VNPAY',
}

export interface ITransaction {
  _id?: Types.ObjectId | string;
  code: string;
  invoiceId: Types.ObjectId | string;
  studentId: Types.ObjectId | string;
  amount: number;
  paymentMethod: PaymentMethod;
  note?: string;
  processedBy: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTransactionDTO {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  note?: string;
}
