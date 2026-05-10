export type ExpenditureType = 'SALARY' | 'OPERATION';

export interface IExpenditure {
  code: string;
  expenditureType: ExpenditureType;
  amount: number;
  receiverId: string;
  paidBy: string;
  payrollId?: string;
  fixedCostId?: string;
  description: string;
  date: Date;
}

export interface CreateExpenditure {
  type: string;
  amount: number;
  receiverId: string;
  paidBy: string;
  description: string;
  date: Date;
  payrollId?: string;
  fixedCostId?: string;
}
