import type { ICourse } from './course.type';
import type { IRoom } from './room.type';
import type { IUser } from './user.type';

export const ClassStatus = {
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  MAINTENANCE: 'MAINTENANCE',
  PENDING: 'PENDING',
} as const;

export type ClassStatus = (typeof ClassStatus)[keyof typeof ClassStatus];

export interface IClass {
  _id?: string;
  name: string;
  courseId: string | { _id: string; title: string; basePrice?: number };
  teacherId: string | { _id: string; fullName: string };
  roomId: string | { _id: string; name: string };
  documents?: string[];
  studentIds?: (string | { _id: string; fullName: string })[];
  status: ClassStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetClassesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface GetStudentsByClassParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<IClass>) => void;
  initialData?: IClass;
}

export interface IPopulatedClass {
  _id: string;
  courseId: ICourse | null;
  teacherId: IUser | null;
  roomId: IRoom | null;
  studentIds: IUser[];
  documents: string[];
  name: string;
  status: ClassStatus;
  createdAt?: string;
  updatedAt?: string;
}
