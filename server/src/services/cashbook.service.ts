import { ExpenditureModel } from '../models/expenditure.model';
import { TransactionModel } from '../models/transaction.model';

export class CashBookService {
  async getCashBook(query: any) {
    const { startDate, endDate, type, search, dateRange } = query;
    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;
    let totalIn = 0;
    let totalOut = 0;
    let totalRefund = 0;
    let balance = 0;

    const start = (page - 1) * limit;
    const end = start + limit;

    const filter: any = {};

    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (search) {
      filter.$or = [{ code: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    }

    const expenditures = await ExpenditureModel.find(filter).populate('paidBy', 'fullName').sort({ date: -1 });
    const transactions = await TransactionModel.find(filter)
      .populate('processedBy', 'fullName')
      .sort({ createdAt: -1 });

    let cashBookData: any[] = [];

    if (!type || type === 'IN' || type === 'ALL') {
      for (const item of transactions) {
        const obj = {
          ...item.toObject(),
          type: 'IN',
          time: item.createdAt as any,
        };
        cashBookData.push(obj);
        totalIn += obj.amount || 0;
      }
    }

    if (!type || type === 'OUT' || type === 'ALL') {
      for (const item of expenditures) {
        const obj = {
          ...item.toObject(),
          type: 'OUT',
          time: item.date as any,
        };
        cashBookData.push(obj);
        totalOut += obj.amount || 0;
      }
    }

    if (!type || type === 'ALL') cashBookData.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    balance = totalIn - totalOut - totalRefund;

    return {
      data: cashBookData.slice(start, end),
      total: cashBookData.length,
      summary: {
        totalIn,
        totalOut,
        totalRefund,
        balance,
      },
    };
  }
}
