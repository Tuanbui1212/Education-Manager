import mongoose, { Schema } from 'mongoose';
import { IPayroll, PayrollType, PayrollStatus } from '../types/payroll.type';

const PayrollSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true }, // VD: '2026-03'
    roleName: { type: String, required: true },
    payrollType: {
      type: String,
      enum: Object.values(PayrollType),
      required: true,
    },
    baseSalary: { type: Number, required: true, default: 0 },
    hourlyRate: { type: Number, required: true, default: 0 },
    metrics: {
      standardDays: { type: Number },
      actualDays: { type: Number },
      standardHours: { type: Number },
      teachingHours: { type: Number },
    },
    allowance: { type: Number, default: 0 },
    deduction: { type: Number, default: 0 },
    totalSalary: { type: Number, required: true },
    isEmailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date, default: null },
    status: {
      type: String,
      enum: Object.values(PayrollStatus),
      default: PayrollStatus.PENDING,
    },
    bankInfo: {
      bankName: { type: String },
      bankBin: { type: String },
      accountNo: { type: String },
      accountName: { type: String },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

PayrollSchema.index({ userId: 1, month: 1 }, { unique: true });

export default mongoose.model<IPayroll>('Payroll', PayrollSchema, 'payrolls');
