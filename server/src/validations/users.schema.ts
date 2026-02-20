import { z } from "zod";
import { UserRole } from "../types/user.type";
export const CreateUserSchema = z.object({
    email: z.string({error: "Email là bắt buộc"}).email("Email không hợp lệ").trim().max(50, "Email tối đa 50 ký tự"),
    password: z.string({ error: "Mật khẩu là bắt buộc" }).trim().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(50, "Mật khẩu tối đa 50 ký tự"),
    fullName: z.string({ error: "Họ tên là bắt buộc" }).trim().min(2, "Họ tên phải có ít nhất 2 ký tự").max(50, "Họ tên tối đa 50 ký tự"),
    phone: z.string({ error: "Số điện thoại là bắt buộc" }).trim().length(10, "Số điện thoại phải có 10 số"),
    role: z.preprocess(val => (typeof val === 'string' ? val.toUpperCase() : val), z.enum(UserRole, { message: "Role không hợp lệ" })).default(UserRole.STUDENT)
});

export const UpdateUserSchema = z.object({
    fullName: z.string({ error: "Họ tên là bắt buộc" }).trim().min(2, "Họ tên phải có ít nhất 2 ký tự").max(50, "Họ tên tối đa 50 ký tự").optional(),
    phone: z.string({ error: "Số điện thoại là bắt buộc" }).trim().length(10, "Số điện thoại phải có 10 số").optional(),
    password: z.string({ error: "Mật khẩu là bắt buộc" }).trim().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(50, "Mật khẩu tối đa 50 ký tự").optional(),
    role: z.preprocess(val => (typeof val === 'string' ? val.toUpperCase() : val), z.enum(UserRole, { message: "Role không hợp lệ" })).optional()
});

export type CreateUserSchema = z.infer<typeof CreateUserSchema>;
export type UpdateUserSchema = z.infer<typeof UpdateUserSchema>;
