export interface IExamOption {
    _id?: string;
    content: string;
    isCorrect: boolean;
}

export interface IExamQuestion {
    _id?: string;
    content: string;
    points: number;
    options: IExamOption[];
}

export interface IExam {
    _id: string;
    title: string;
    description?: string;
    classId: string | { _id: string; name: string };
    teacherId: string | { _id: string; fullName: string };
    startDate: string;
    endDate: string;
    duration: number;
    questions: IExamQuestion[];
    status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
    createdAt: string;
}

export interface IExamSubmission {
    _id: string;
    examId: string;
    studentId: string | { _id: string; fullName: string; email: string };
    classId: string;
    answers: { questionId: string; selectedOptionIds: string[] }[];
    score: number;
    startedAt: string;
    completedAt?: string;
    timeTaken?: number;
    status: 'IN_PROGRESS' | 'SUBMITTED';
}