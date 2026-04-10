import { z } from 'zod';
import { PayrollType, PayrollStatus } from '../types/payroll.type';

export const createPayrollSchema = z.object({
  userId: z.string({ message: 'ID người dùng là bắt buộc' }).regex(/^[0-9a-fA-F]{24}$/, 'ID người dùng không hợp lệ'),

  month: z
    .string({ message: 'Tháng chốt lương là bắt buộc' })
    .regex(/^\d{4}-\d{2}$/, 'Tháng phải có định dạng YYYY-MM (VD: 2026-03)'),

  roleName: z.string({ message: 'Tên chức vụ là bắt buộc' }).min(1, 'Tên chức vụ không được để trống'),

  payrollType: z.nativeEnum(PayrollType, {
    message: 'Loại lương là bắt buộc',
  }),

  baseSalary: z.number({ message: 'Lương cứng là bắt buộc' }).min(0, 'Lương cứng không được âm'),

  hourlyRate: z.number({ message: 'Thù lao theo giờ là bắt buộc' }).min(0, 'Thù lao theo giờ không được âm'),

  metrics: z
    .object({
      standardDays: z.number().optional(),
      actualDays: z.number().optional(),
      standardHours: z.number().optional(),
      teachingHours: z.number().optional(),
    })
    .optional(),

  allowance: z.number({}).min(0, 'Phụ cấp không được âm').optional(),

  deduction: z.number({}).min(0, 'Khấu trừ không được âm').optional(),

  totalSalary: z.number({ message: 'Tổng lương là bắt buộc' }),

  status: z.nativeEnum(PayrollStatus, {}).optional(),

  bankInfo: z
    .object({
      bankName: z.string({ message: 'Tên ngân hàng là bắt buộc' }),
      bankBin: z.string({ message: 'Mã BIN ngân hàng là bắt buộc' }),
      accountNo: z.string({ message: 'Số tài khoản là bắt buộc' }),
      accountName: z.string({ message: 'Tên chủ tài khoản là bắt buộc' }),
    })
    .optional(),
});

export const updatePayrollSchema = createPayrollSchema.partial();

export const payrollIdSchema = z.object({
  id: z.string({ message: 'ID bảng lương là bắt buộc' }).regex(/^[0-9a-fA-F]{24}$/, 'ID bảng lương không hợp lệ'),
});
