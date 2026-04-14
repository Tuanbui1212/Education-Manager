export type InvoiceStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'CANCELLED' | 'REFUNDED' | 'OVERDUE';

export interface InvoiceConfig {
  totalMonths: number;
  amountPerMonth: number;
  paidMonths: number;
  nextDueDate: Date;
}

export interface IInvoice {
  _id: string;
  code: string;
  studentId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  classId: {
    _id: string;
    name: string;
  };
  consultantId?: {
    _id: string;
    fullName: string;
  };

  finalAmount: number;
  debt: number;
  status: InvoiceStatus;
  installmentConfig?: InvoiceConfig;
  dueDate: string;
  remindCount?: number;
  lastRemindedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceType {
  studentId: string;
  classId: string;
  consultantId?: string;
  finalAmount: number;
  dueDate?: string;
}

export interface UpdateInvoiceType extends Partial<CreateInvoiceType> {
  status?: InvoiceStatus;
  dueDate?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  totalCount?: number;
}
