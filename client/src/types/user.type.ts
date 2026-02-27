export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'SALE' | 'TEACHING_ASSISTANT';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface IStudentInfo {
  parentsName?: string;
  crmHistory?: string[];
  consultantId?: string;
}

export interface ITeacherInfo {
  hourlyRate?: number;
  degrees?: string[];
}

export interface IUser {
  _id?: string;
  email: string;
  phone: string;
  password?: string;
  fullName: string;
  role: UserRole;
  date: Date;
  status: 'ACTIVE' | 'INACTIVE';
  student_info?: IStudentInfo;
  teacher_info?: ITeacherInfo;
  createdAt: string;
  updatedAt: string;
}
export interface UserResponse {
  success: boolean;
  message: string;
  data: IUser[];
}

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<IUser>) => void;
  initialData?: IUser | null;
  loading?: boolean;
}
