import { Document, Types } from 'mongoose';

export enum ExpenditureType {
  SALARY = 'SALARY',
  OPERATION = 'OPERATION',
}

export interface IExpenditure extends Document {
  code: string;
  expenditureType: ExpenditureType;
  amount: number;
  receiverId: Types.ObjectId;
  paidBy: Types.ObjectId;
  payrollId?: Types.ObjectId;
  fixedCostId?: Types.ObjectId;
  description: string;
  date: Date;
}
