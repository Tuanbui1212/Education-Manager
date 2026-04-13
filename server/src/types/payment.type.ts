export interface IPaymentRequest {
  userId: string;
  orderId: string;
  amount: number;
  paymentMethod: 'VNPAY' | 'MOMO' | 'STRIPE';
}

export interface ITransaction {
  _id?: string;
  userId: string;
  orderId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  gatewayResponse?: any;
  createdAt?: Date;
}
