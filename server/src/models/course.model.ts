import mongoose, { Schema } from 'mongoose';
import { ICourse } from '../types/course.type';

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: [true, 'Tên khóa học là bắt buộc'] },
    basePrice: { type: Number, required: [true, 'Giá cơ bản là bắt buộc'] },
    syllabus: { type: String, required: [true, 'Nội dung khóa học là bắt buộc'] },
    totalLessons: { type: Number, required: [true, 'Tổng số bài học là bắt buộc'] },
  },
  { timestamps: true },
);

export const CourseModel = mongoose.model<ICourse>('Course', CourseSchema);
