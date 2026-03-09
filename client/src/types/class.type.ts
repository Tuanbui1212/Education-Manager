export const ClassStatus = {
    ACTIVE: "ACTIVE",
    MAINTENANCE: "MAINTENANCE",
    INACTIVE: "INACTIVE",
} as const;

export type ClassStatus = (typeof ClassStatus)[keyof typeof ClassStatus];

export interface IClass {
    _id?: string;
    name: string;
    courseId: string | { _id: string; title: string };
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
