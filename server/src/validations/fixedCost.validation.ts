import { z } from 'zod';
import { CycleEnum, StatusEnum } from '../types/fixedCost.type';

export const createFixedCostSchema = z.object({
  name: z.string({ message: 'Tên chi phí là bắt buộc' }).min(3, 'Tên quá ngắn'),
  amount: z.number({ message: 'Số tiền là bắt buộc' }).min(0, 'Số tiền không được âm'),
  cycle: z.nativeEnum(CycleEnum, { message: 'Chu kỳ không hợp lệ' }),
  payDay: z.number().min(1).max(31, 'Ngày thanh toán phải từ 1-31'),
  status: z.nativeEnum(StatusEnum).optional(),
  startDate: z.string().datetime({ message: 'Ngày bắt đầu phải đúng định dạng ISO 8601' }),
  endDate: z.string().datetime().optional().nullable(),
  description: z.string().optional(),
});

export const updateFixedCostSchema = z.object({
  name: z.string().min(3).optional(),
  amount: z.number().min(0).optional(),
  cycle: z.nativeEnum(CycleEnum).optional(),
  payDay: z.number().min(1).max(31).optional(),
  status: z.nativeEnum(StatusEnum).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
  description: z.string().optional(),
});
