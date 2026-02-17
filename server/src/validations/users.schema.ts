import { z } from "zod";

export const CreateUserSchema = z.object({
    email: z.email("Email không hợp lệ").max(50, "Email tối đa 50 ký tự").trim().nonempty("Email không được để trống"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(50, "Mật khẩu tối đa 50 ký tự").trim().nonempty("Mật khẩu không được để trống"),
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(50, "Họ tên tối đa 50 ký tự").trim().nonempty("Họ tên không được để trống"),
    phone: z.string().length(10, "Số điện thoại phải có 10 số").trim().nonempty("Số điện thoại không được để trống"),
});

export const UpdateUserSchema = z.object({
    email: z.email("Email không hợp lệ").max(50, "Email tối đa 50 ký tự").trim().nonempty("Email không được để trống"),
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(50, "Họ tên tối đa 50 ký tự").trim().nonempty("Họ tên không được để trống"),
    phone: z.string().length(10, "Số điện thoại phải có 10 số").trim().nonempty("Số điện thoại không được để trống"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(50, "Mật khẩu tối đa 50 ký tự").trim().optional(),
});

export type CreateUserSchema = z.infer<typeof CreateUserSchema>;
export type UpdateUserSchema = z.infer<typeof UpdateUserSchema>;
