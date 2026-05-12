import mongoose, { Schema } from 'mongoose';
import { IClassRequest } from '../types/classRequest.type';

const ClassRequestSchema = new Schema<IClassRequest>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Người tạo là bắt buộc'] },
    name: { type: String, required: [true, 'Tên lớp học là bắt buộc'], trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: [true, 'Khóa học là bắt buộc'] },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Giáo viên là bắt buộc'] },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', optional: true },
    startDate: { type: String },
    totalLessons: { type: Number, required: [true, 'Số lượng bài học là bắt buộc'] },
    maxNumberOfStudents: { type: Number, required: [true, 'Số lượng học viên tối đa là bắt buộc'] },
    lessonsPerWeek: { type: Number, required: [true, 'Số lượng bài học mỗi tuần là bắt buộc'] },
    optionalRequirements: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const ClassRequestModel = mongoose.model<IClassRequest>('ClassRequest', ClassRequestSchema);
