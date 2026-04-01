import { z } from 'zod';
import { UserStatus, Gender, TeacherType } from '../types/user.type';

const TeacherInfoSchema = z.object({
  type: z.nativeEnum(TeacherType, { message: 'Loại giảng viên không hợp lệ' }).optional(),
  hourlyRate: z.coerce.number().min(0, 'Mức lương giờ không được âm').optional(),
});

const BankInfoSchema = z.object({
  bankName: z.string({ message: 'Tên ngân hàng là bắt buộc' }).optional(),
  bankBin: z.string({ message: 'Mã ngân hàng là bắt buộc' }).optional(),
  accountNo: z.string({ message: 'Số tài khoản là bắt buộc' }).optional(),
  accountName: z.string({ message: 'Tên chủ tài khoản là bắt buộc' }).optional(),
});

const StudentInfoSchema = z.object({
  parentsName: z.string().optional(),
  crmHistory: z.array(z.string()).optional(),
  consultantId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'ID Tư vấn viên không hợp lệ')
    .optional(),
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
  gender: z.nativeEnum(Gender, { message: 'Giới tính không hợp lệ' }),
  phone: z.string({ message: 'Số điện thoại là bắt buộc' }).trim().length(10, 'Số điện thoại phải có chính xác 10 số'),
  date: z.coerce.date({ message: 'Ngày sinh không hợp lệ' }),
  degrees: z.array(z.string({ message: 'Bằng cấp phải là chuỗi' })).optional(),
  certificates: z.array(z.string({ message: 'Chứng chỉ phải là chuỗi' })).optional(),
  baseSalary: z.number({ message: 'Lương cơ bản phải là số' }).optional(),
  status: z
    .nativeEnum(UserStatus, {
      message: 'Trạng thái không hợp lệ',
    })
    .optional(),

  roleId: z
    .string({ message: 'Vai trò là bắt buộc' })
    .regex(/^[0-9a-fA-F]{24}$/, 'ID Vai trò không hợp lệ (Phải là ObjectId 24 ký tự)'),
  bankInfo: BankInfoSchema.optional(),
  teacher_info: TeacherInfoSchema.optional(),
  student_info: StudentInfoSchema.optional(),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string({ message: 'Mật khẩu cũ là bắt buộc' }).trim().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  newPassword: z.string({ message: 'Mật khẩu mới là bắt buộc' }).trim().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const UpdateUserSchema = CreateUserSchema.omit({ email: true }).partial();

export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>;
export type UpdateUserSchemaType = z.infer<typeof UpdateUserSchema>;
