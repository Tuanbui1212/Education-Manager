export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD';

export type TransactionType = 'IN' | 'OUT' | 'REFUND';
export interface ITransaction {
  _id: string;
  code: string;
  invoiceId: string | any;
  studentId: string | any;
  amount: number;
  paymentMethod: PaymentMethod;
  note?: string;
  processedBy: string | any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDTO {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  processedBy: string;
  note?: string;
}

export interface ICashTransaction {
  _id: string;
  code: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
  creatorName: string;
}
