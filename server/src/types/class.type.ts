import { Types } from "mongoose";

export enum ClassStatus {
    ACTIVE = "ACTIVE",
    MAINTENANCE = "MAINTENANCE",
    INACTIVE = "INACTIVE",
}

export interface IClass {
    name: string,
    courseId: Types.ObjectId,
    teacherId: Types.ObjectId,
    roomId: Types.ObjectId,
    documents: Array<string>,
    studentIds: Array<Types.ObjectId>,
    status: ClassStatus,
}

export interface GetClassesQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: ClassStatus;
}
