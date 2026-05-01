import { ExpenditureModel } from '../models/expenditure.model';
import { TransactionModel } from '../models/transaction.model';
import { InvoiceModel } from '../models/invoice.model';
import { IInvoice } from '../types/invoice.type';

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
      const searchRegex = { $regex: search, $options: 'i' };
      const matchingInvoices = await InvoiceModel.find({ code: searchRegex }).select('_id');
      const invoiceIds = matchingInvoices.map((inv) => inv._id);

      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } },
        { invoiceId: { $in: invoiceIds } },
      ];
    }

    let cashBookData: any[] = [];

    if (!type || type === 'IN' || type === 'ALL') {
      const transactions = await TransactionModel.find(filter)
        .populate<{ invoiceId: IInvoice | null }>({
          path: 'invoiceId',
          select: 'code status',
        })
        .populate('processedBy', 'fullName')
        .sort({ createdAt: -1 });

      for (const item of transactions) {
        if (item.invoiceId && item.invoiceId.status === 'REFUNDED') continue;

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
      const expenditures = await ExpenditureModel.find(filter).populate('paidBy', 'fullName').sort({ date: -1 });
      for (const item of expenditures) {
        const obj = {
          ...item.toObject(),
          type: 'OUT',
          time: item.date as any,
        };
        cashBookData.push(obj);
        totalOut += obj.amount || 0;
      }

      const transactions = await TransactionModel.find(filter)
        .populate<{ invoiceId: IInvoice | null }>({
          path: 'invoiceId',
          match: { status: 'REFUNDED' },
          select: 'code status',
        })
        .populate('processedBy', 'fullName')
        .sort({ createdAt: -1 });

      for (const item of transactions) {
        if (!item.invoiceId) continue;

        const obj = {
          ...item.toObject(),
          type: 'OUT',
          time: item.createdAt as any,
        };
        cashBookData.push(obj);
        totalRefund += obj.amount || 0;
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

  async getCashBookById(id: string, type: string, table: string) {
    if (type === 'IN') {
      const transaction = await TransactionModel.findById(id)
        .populate('studentId', 'fullName')
        .populate('processedBy', 'fullName email roleId')
        .populate<{ invoiceId: IInvoice | null }>('invoiceId')
        .lean();

      if (!transaction) throw new Error('Không tìm thấy giao dịch');

      return { type: 'IN', ...transaction };
    } else if (type === 'OUT' && table === 'transaction') {
      const transaction = await TransactionModel.findById(id)
        .populate('studentId', 'fullName')
        .populate('processedBy', 'fullName email roleId')
        .populate<{ invoiceId: IInvoice | null }>('invoiceId')
        .lean();

      if (!transaction) throw new Error('Không tìm thấy giao dịch');

      return { type: 'OUT', ...transaction };
    } else if (type === 'OUT' && table === 'expenditure') {
      const expenditure = await ExpenditureModel.aggregate([
        { $match: { _id: id } },
        {
          $lookup: {
            from: 'payrolls',
            localField: 'payrollId',
            foreignField: '_id',
            as: 'payroll',
          },
        },
        {
          $unwind: '$payroll',
        },
        {
          $lookup: {
            from: 'users',
            let: { receiverId: '$receiverId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$receiverId'] },
                },
              },
              {
                $lookup: {
                  from: 'roles',
                  let: { roleId: '$roleId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$roleId'] },
                      },
                    },
                    {
                      $project: { name: 1 },
                    },
                  ],
                  as: 'role',
                },
              },
              { $unwind: '$role' },
              {
                $project: {
                  fullName: 1,
                  email: 1,
                  phone: 1,
                  role: 1,
                },
              },
            ],
            as: 'receiver',
          },
        },
        {
          $unwind: '$receiver',
        },
        {
          $lookup: {
            from: 'users',
            let: { paidById: '$paidBy' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$paidById'] },
                },
              },
              {
                $project: {
                  fullname: 1,
                },
              },
            ],
            as: 'paidBy',
          },
        },
        {
          $unwind: '$paidBy',
        },
      ]);

      if (!expenditure) throw new Error('Không tìm thấy chi tiêu');
      return { type: 'OUT', ...expenditure };
    } else {
      throw new Error('Không tìm thấy bảng thu chi');
    }
  }
}
