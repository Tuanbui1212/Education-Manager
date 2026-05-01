import mongoose, { Schema, Document } from 'mongoose';
import { ITransaction, PaymentMethod } from '../types/transaction.type';

export interface TransactionDocument extends Omit<ITransaction, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    code: { type: String, required: true, unique: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    studentId: { type: Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    note: { type: String },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false },
);

export const TransactionModel = mongoose.model<TransactionDocument>('Transaction', transactionSchema);
