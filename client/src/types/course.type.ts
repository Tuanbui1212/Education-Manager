export interface ICourse {
    _id?: string;
    title: string;
    basePrice: number;
    syllabus: string;
    totalLessons: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface GetCoursesParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface CourseResponse {
    success: boolean;
    message: string;
    data?: ICourse | ICourse[];
    totalCount?: number;
}

export interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<ICourse>) => void;
    initialData?: ICourse;
}
