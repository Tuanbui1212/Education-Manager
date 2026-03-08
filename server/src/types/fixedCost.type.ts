export enum CycleEnum {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum StatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface IFixedCost {
  name: string;
  amount: number;
  cycle: CycleEnum;
  payDay: number;
  status: StatusEnum;
  startDate: Date;
  endDate?: Date;
  description?: string;
}
