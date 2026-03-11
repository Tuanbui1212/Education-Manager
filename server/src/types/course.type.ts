import { Document } from "mongoose";
export interface ICourse extends Document {
    title: string,
    basePrice: number,
    syllabus: string,
}

export interface GetCoursesQuery {
    page?: number;
    limit?: number;
    search?: string;
}
