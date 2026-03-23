import { TransactionModel } from '../models/transaction.model';
import { InvoiceModel } from '../models/invoice.model';
import type { CreateTransactionDTO } from '../types/transaction.type';
import { InvoiceStatus } from '../types/invoice.type';

export class TransactionService {
  async processPayment(data: CreateTransactionDTO, processedBy: string) {
    const invoice = await InvoiceModel.findById(data.invoiceId);
    if (!invoice) throw new Error('Không tìm thấy hóa đơn');
    if (invoice.status === InvoiceStatus.PAID) throw new Error('Hóa đơn này đã được thanh toán đủ');
    if (invoice.status === 'CANCELLED') throw new Error('Hóa đơn đã bị hủy');

    if (data.amount > invoice.debt) {
      throw new Error(`Số tiền thu (${data.amount}) vượt quá công nợ hiện tại (${invoice.debt})`);
    }

    const year = new Date().getFullYear();
    const lastTx = await TransactionModel.findOne({ code: new RegExp(`^PT-${year}-`) }).sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastTx && lastTx.code) {
      const parts = lastTx.code.split('-');
      nextNumber = parseInt(parts[parts.length - 1], 10) + 1;
    }
    const code = `PT-${year}-${nextNumber.toString().padStart(4, '0')}`;

    const newTransaction = await TransactionModel.create({
      code,
      invoiceId: invoice._id,
      studentId: invoice.studentId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      note: data.note || 'Thu tiền học phí',
      processedBy,
    });

    const newDebt = invoice.debt - data.amount;
    const newStatus = newDebt === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;

    invoice.debt = newDebt;
    invoice.status = newStatus;
    await invoice.save();

    return {
      transaction: newTransaction,
      remainingDebt: newDebt,
      invoiceStatus: newStatus,
    };
  }

  async getTransactions(query: any) {
    const { invoiceId, studentId, limit = 10, page = 1 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (invoiceId) filter.invoiceId = invoiceId;
    if (studentId) filter.studentId = studentId;

    const [transactions, total] = await Promise.all([
      TransactionModel.find(filter)
        .populate('studentId', 'fullName')
        .populate('processedBy', 'fullName')
        .populate('invoiceId', 'code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      TransactionModel.countDocuments(filter),
    ]);

    return { transactions, total };
  }
}
