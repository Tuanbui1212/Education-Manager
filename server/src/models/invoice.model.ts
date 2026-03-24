import mongoose, { Schema, Document } from 'mongoose';
import { IInvoice, InvoiceStatus } from '../types/invoice.type';
export interface InvoiceDocument extends Omit<IInvoice, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    code: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    consultantId: { type: Schema.Types.ObjectId, ref: 'User' },
    finalAmount: { type: Number, required: true },
    debt: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.UNPAID,
    },

    installmentConfig: {
      totalMonths: { type: Number },
      amountPerMonth: { type: Number },
    },

    dueDate: { type: Date },
    remindCount: { type: Number, default: 0 },
    lastRemindedAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const InvoiceModel = mongoose.model<InvoiceDocument>('Invoice', invoiceSchema);
