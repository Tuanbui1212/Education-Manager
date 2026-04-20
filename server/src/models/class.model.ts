import mongoose, { Schema } from 'mongoose';
import { IClass, ClassStatus } from '../types/class.type';

const ClassSchema = new Schema<IClass>(
  {
    name: { type: String, required: [true, 'Tên lớp học là bắt buộc'], trim: true, unique: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: [true, 'Khóa học là bắt buộc'] },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Giáo viên là bắt buộc'] },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: [true, 'Phòng học là bắt buộc'] },
    documents: { type: [String], default: [] },
    studentIds: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    startDate: { type: String },
    status: {
      type: String,
      enum: { values: Object.values(ClassStatus), message: '{VALUE} không hợp lệ' },
      default: ClassStatus.UPCOMING,
    },
  },
  { timestamps: true },
);

export const ClassModel = mongoose.model<IClass>('Class', ClassSchema);
