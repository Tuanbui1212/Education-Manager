export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'POTENTIAL' | 'BLOCKED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type TypeTeacher = 'FULL_TIME' | 'PART_TIME';

export interface IRole {
  _id: string;
  name: string;
  permissions?: string[];
}

export interface IBankInfo {
  bankName: string;
  bankBin: string;
  accountNo: string;
  accountName: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  status?: string;
}

export interface IStudentInfo {
  parentsName?: string;
  crmHistory?: string[];
  consultantId?: string;
}

export interface ITeacherInfo {
  type?: TypeTeacher;
  hourlyRate?: number;
}

export interface IUser {
  _id?: string;
  email: string;
  phone: string;
  gender: Gender;
  password?: string;
  fullName: string;
  roleId: IRole | string;
  date: string | Date;
  status: UserStatus;
  degrees?: string[];
  certificates?: string[];
  baseSalary?: number;
  bankInfo?: IBankInfo;
  student_info?: IStudentInfo;
  teacher_info?: ITeacherInfo;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}
export interface UserResponse {
  success: boolean;
  message: string;
  data: IUser[];
  totalCount: number;
}

export interface UserModalProps {
  roles: IRole[];
  isOpen: boolean;
  consultants?: IUser[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: IUser | null;
  loading?: boolean;
}
