import { z } from 'zod';

export const createPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  paymentMethod: z.enum(['VNPAY', 'MOMO', 'STRIPE']),
});
