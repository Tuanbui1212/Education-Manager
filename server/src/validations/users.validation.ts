import { z } from 'zod';
import { UserStatus } from '../types/user.type';

const TeacherInfoSchema = z.object({
  hourlyRate: z.number().optional(),
  degrees: z.array(z.string()).optional(),
});

const StudentInfoSchema = z.object({
  parentsName: z.string().optional(),
  crmHistory: z.array(z.string()).optional(),
  consultantId: z.string().optional(),
});

export const CreateUserSchema = z.object({
  email: z.string({ message: 'Email là bắt buộc' }).trim().email('Email không hợp lệ').max(50, 'Email tối đa 50 ký tự'),
  password: z
    .string({ message: 'Mật khẩu là bắt buộc' })
    .trim()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu tối đa 50 ký tự'),
  fullName: z
    .string({ message: 'Họ tên là bắt buộc' })
    .trim()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên tối đa 50 ký tự'),
  phone: z.string({ message: 'Số điện thoại là bắt buộc' }).trim().length(10, 'Số điện thoại phải có chính xác 10 số'),
  date: z.coerce.date({ message: 'Ngày sinh không hợp lệ' }).optional(),
  status: z.nativeEnum(UserStatus, {
    error: 'Trạng thái không hợp lệ',
  }),
  role: z.string({ message: 'Vai trò là bắt buộc' }).trim().optional(),
  teacher_info: TeacherInfoSchema.optional(),
  student_info: StudentInfoSchema.optional(),
});

export const UpdateUserSchema = CreateUserSchema.omit({ email: true }).partial().strict();

export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>;
export type UpdateUserSchemaType = z.infer<typeof UpdateUserSchema>;
