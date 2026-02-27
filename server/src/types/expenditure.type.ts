import { Document, Types } from 'mongoose';

export enum ExpenditureType {
  SALARY_TEACHER = 'SALARY_TEACHER',
  SALARY_SALE = 'SALARY_SALE',
  OPERATION = 'OPERATION',
}

export interface IExpenditure extends Document {
  type: ExpenditureType;
  amount: number;
  receiverId: Types.ObjectId;
  description: string;
  date: Date;
}
