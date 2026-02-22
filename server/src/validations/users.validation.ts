import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ').max(50, 'Email tối đa 50 ký tự'),
  password: z.string().trim().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').max(50, 'Mật khẩu tối đa 50 ký tự'),
  fullName: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(50, 'Họ tên tối đa 50 ký tự'),
  phone: z.string().trim().length(10, 'Số điện thoại phải có chính xác 10 số'),
  role: z.string().trim().optional(),
});

export const UpdateUserSchema = CreateUserSchema.omit({ email: true }).partial().strict();

export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>;
export type UpdateUserSchemaType = z.infer<typeof UpdateUserSchema>;
