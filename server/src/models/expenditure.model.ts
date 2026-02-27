import { Schema, model } from 'mongoose';
import { IExpenditure, ExpenditureType } from '../types/expenditure.type';

const ExpenditureSchema = new Schema<IExpenditure>(
  {
    type: {
      type: String,
      enum: Object.values(ExpenditureType),
      required: true,
    },
    amount: { type: Number, required: true, default: 0 },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

export const ExpenditureModel = model<IExpenditure>('Expenditure', ExpenditureSchema);
