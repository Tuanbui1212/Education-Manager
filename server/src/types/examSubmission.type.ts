import { Types, Document } from "mongoose";

export enum ExamSubmissionStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    SUBMITTED = 'SUBMITTED'
}

export interface IStudentAnswer extends Document {
    questionId: Types.ObjectId;
    selectedOptionIds: Types.ObjectId[];
}

export interface IExamSubmission extends Document {
    examId: Types.ObjectId;
    studentId: Types.ObjectId;
    classId: Types.ObjectId;
    answers: IStudentAnswer[];
    score: number;
    startedAt: Date;
    completedAt: Date;
    timeTaken: number;
    status: ExamSubmissionStatus;
}

