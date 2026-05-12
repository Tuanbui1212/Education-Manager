import mongoose, { Schema } from 'mongoose';
import { IScheduleRequest } from '../types/scheduleRequest.type';

// Sub-document cho từng lớp và tùy chọn của lớp đó
const classPreferenceSchema = new Schema(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    optionalRequirements: [{ type: String }],
  },
  { _id: false }, // Không cần tạo _id riêng cho sub-document để tối ưu
);

const scheduleRequestSchema = new Schema(
  {
    classes: [classPreferenceSchema],
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending', // Vừa lưu xong sẽ ở trạng thái chờ xử lý
    },
  },
  { timestamps: true }, // Tự động tạo createdAt, updatedAt
);

export const ScheduleRequest = mongoose.model<IScheduleRequest>('ScheduleRequest', scheduleRequestSchema);
