import { Document, Types } from 'mongoose';

export enum ExamStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    CLOSED = 'CLOSED'
}

export interface IOption extends Document {
    content: string;
    isCorrect: boolean;
}

export interface IQuestion extends Document {
    content: string;
    points: number;
    options: IOption[];
}

export interface IExam extends Document {
    title: string;
    description: string;
    classId: Types.ObjectId;
    teacherId: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    duration: number;
    questions: IQuestion[];
    status: ExamStatus;
}