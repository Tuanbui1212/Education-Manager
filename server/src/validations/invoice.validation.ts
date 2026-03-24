import { z } from 'zod';
import { InvoiceStatus } from '../types/invoice.type';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const installmentConfigSchema = z.object({
  totalMonths: z.number().int().min(2, 'Số kỳ trả góp tối thiểu là 2'),
  amountPerMonth: z.number().min(0, 'Số tiền mỗi kỳ không được âm'),
});

export const createInvoiceSchema = z.object({
  studentId: z.string().regex(objectIdRegex, 'ID học viên không hợp lệ (Phải là ObjectId)'),
  classId: z.string().regex(objectIdRegex, 'ID lớp học không hợp lệ (Phải là ObjectId)'),
  consultantId: z.string().regex(objectIdRegex, 'ID tư vấn viên không hợp lệ').optional(),
  finalAmount: z.number({ message: 'Tổng tiền là bắt buộc' }).min(0, 'Tổng tiền không được âm'),
  dueDate: z.string().datetime({ message: 'Định dạng ngày không hợp lệ (ISO 8601)' }).optional(),
  installmentConfig: installmentConfigSchema.optional(),
});

export const updateInvoiceSchema = z.object({
  studentId: z.string().regex(objectIdRegex, 'ID học viên không hợp lệ').optional(),
  classId: z.string().regex(objectIdRegex, 'ID lớp học không hợp lệ').optional(),
  consultantId: z.string().regex(objectIdRegex, 'ID tư vấn viên không hợp lệ').optional(),
  finalAmount: z.number().min(0, 'Tổng tiền không được âm').optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  dueDate: z.string().datetime().optional(),
  installmentConfig: installmentConfigSchema.optional(),
});

export const invoiceIdSchema = z.object({
  id: z.string().regex(objectIdRegex, 'ID hóa đơn không hợp lệ'),
});

export type CreateInvoiceDTO = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceDTO = z.infer<typeof updateInvoiceSchema>;
