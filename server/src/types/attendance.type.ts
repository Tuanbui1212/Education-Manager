import { Document, Types } from "mongoose";

export interface IAttendance extends Document {
    scheduleId: Types.ObjectId;
    studentId: Types.ObjectId;
    classId: Types.ObjectId;
    homework: HomeworkStatus;
    teacherComment: string;
    mark: number;
    status: AttendanceStatus;
}

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    LATE = 'LATE',
}

export enum HomeworkStatus {
    DONE = 'DONE',
    NOT_DONE = 'NOT_DONE',
    NO_HOMEWORK = 'NO_HOMEWORK',
}

export interface GetAttendancesQuery {
    page?: number;
    limit?: number;
    scheduleId?: string;
    studentId?: string;
    status?: string;
}