import { z } from 'zod';
import { ExpenditureType } from '../types/expenditure.type';

export const CreateExpenditureSchema = z.object({
  type: z.nativeEnum(ExpenditureType, {
    error: 'Loại chi tiêu là bắt buộc và phải đúng danh mục',
  }),

  amount: z
    .number({
      message: 'Số tiền phải là con số và không được để trống',
    })
    .min(0, 'Số tiền không được âm'),

  receiverId: z
    .string({ message: 'ID người nhận là bắt buộc' })
    .trim()
    .min(1, 'ID người nhận không được để trống')
    .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'),

  description: z.string().trim().optional(),

  date: z.string().datetime({ message: 'Ngày tháng không đúng định dạng' }).optional(),
});

export const UpdateExpenditureSchema = CreateExpenditureSchema.partial().strict();
