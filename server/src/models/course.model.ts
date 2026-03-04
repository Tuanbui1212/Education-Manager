import mongoose, { Schema } from 'mongoose';
import { ICourse } from '../types/course.type';

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    basePrice: { type: Number, required: true },
    syllabus: { type: String, required: true },
  },
  { timestamps: true },
);

export const CourseModel = mongoose.model<ICourse>('Course', CourseSchema);
