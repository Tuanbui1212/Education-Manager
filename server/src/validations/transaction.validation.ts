import { z } from 'zod';
import { PaymentMethod } from '../types/transaction.type';

export const createTransaction = z.object({
  amount: z.number({ message: 'Chi phí phải là một số và không được để trống' }),
  paymentMethod: z.enum(PaymentMethod, {
    message: 'Phương thức thanh toán không hợp lệ',
  }),
  note: z.string({ message: 'Ghi chú là một chuỗi ' }).trim().optional(),
});
export const UpdateShiftSchema = createTransaction.partial();
