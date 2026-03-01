import mongoose, { Schema } from 'mongoose';
import { IShift, ShiftStatus } from '../types/shift.type';

const ShiftSchema = new Schema<IShift>(
  {
    name: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(ShiftStatus),
      default: ShiftStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ShiftModel = mongoose.model<IShift>('Shift', ShiftSchema);
