export type UserStatus = 'ACTIVE' | 'INACTIVE';
export interface IRole {
  _id: string;
  name: string;
  permissions: string[];
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
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
  roleId: IRole | string;
  date: string | Date;
  status: UserStatus;
  student_info?: IStudentInfo;
  teacher_info?: ITeacherInfo;
  createdAt?: string;
  updatedAt?: string;
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
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: IUser | null;
  loading?: boolean;
}
