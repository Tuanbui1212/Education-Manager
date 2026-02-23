import { UserRole } from '../types/user.type';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string({ error: "Email là bắt buộc" }).trim().email('Email không hợp lệ').max(50, 'Email tối đa 50 ký tự'),
  password: z.string({ error: "Mật khẩu là bắt buộc" }).trim().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').max(50, 'Mật khẩu tối đa 50 ký tự'),
  fullName: z.string({ error: "Họ tên là bắt buộc" }).trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(50, 'Họ tên tối đa 50 ký tự'),
  phone: z.string({ error: "Số điện thoại là bắt buộc" }).trim().length(10, 'Số điện thoại phải có chính xác 10 số'),
  role: z.preprocess(val => (typeof val === 'string' ? val.toUpperCase() : val), z.enum(UserRole, { message: "Role không hợp lệ" })).default(UserRole.STUDENT)
});

export const UpdateUserSchema = CreateUserSchema.omit({ email: true }).partial().strict();

export const IdParamSchema = z.object({
  id: z.string().trim().min(1, 'ID không được để trống').refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: 'ID không hợp lệ',
  }),
});

export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>;
export type UpdateUserSchemaType = z.infer<typeof UpdateUserSchema>;
