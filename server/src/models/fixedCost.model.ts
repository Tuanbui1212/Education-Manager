import mongoose, { Schema } from 'mongoose';
import { IFixedCost, CycleEnum, StatusEnum } from '../types/fixedCost.type';

const FixedCostSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    cycle: {
      type: String,
      enum: Object.values(CycleEnum),
      required: true,
    },
    payDay: { type: Number, required: true, min: 1, max: 31 },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.ACTIVE,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    description: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model<IFixedCost>('FixedCost', FixedCostSchema, 'fixed_costs');
