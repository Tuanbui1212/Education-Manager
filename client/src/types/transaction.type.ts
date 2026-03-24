export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD';

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
