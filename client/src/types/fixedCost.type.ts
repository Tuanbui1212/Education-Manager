export type CycleEnum = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type StatusEnum = 'ACTIVE' | 'INACTIVE';

export interface IFixedCost {
  _id?: string;
  name: string;
  amount: number;
  cycle: CycleEnum;
  payDay: number;
  status: StatusEnum;
  startDate: Date;
  endDate?: Date;
  description?: string;
}
