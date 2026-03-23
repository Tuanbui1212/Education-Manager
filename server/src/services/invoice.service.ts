import { InvoiceModel } from '../models/invoice.model';
import { InvoiceStatus } from '../types/invoice.type';
import type { IInvoice, CreateInvoiceType } from '../types/invoice.type';

export class InvoiceService {
  async createInvoice(data: CreateInvoiceType) {
    const newCode = await this.generateInvoiceCode();

    let finalDueDate = data.dueDate;
    if (!finalDueDate) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      finalDueDate = defaultDate;
    }

    const invoiceData = {
      ...data,
      code: newCode,
      debt: data.finalAmount,
      status: InvoiceStatus.UNPAID,
      remindCount: 0,
      dueDate: finalDueDate,
    };

    return await InvoiceModel.create(invoiceData);
  }

  async getInvoices(query: any) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.code = { $regex: search, $options: 'i' };
    }

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(filter)
        .populate('studentId', 'fullName email phone')
        .populate('classId', 'name')
        .populate('consultantId', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      InvoiceModel.countDocuments(filter),
    ]);

    return { invoices, total };
  }

  async getInvoiceById(id: string) {
    const invoice = await InvoiceModel.findById(id)
      .populate('studentId', 'fullName email phone')
      .populate('classId', 'name')
      .populate('consultantId', 'fullName');

    if (!invoice) throw new Error('Không tìm thấy hóa đơn');
    return invoice;
  }

  async updateInvoice(id: string, data: Partial<IInvoice>) {
    if (data.code) {
      delete data.code;
    }

    const invoice = await InvoiceModel.findByIdAndUpdate(id, data, { new: true })
      .populate('studentId', 'fullName')
      .populate('classId', 'name');

    if (!invoice) throw new Error('Không tìm thấy hóa đơn để cập nhật');
    return invoice;
  }

  async deleteInvoice(id: string) {
    const invoice = await InvoiceModel.findByIdAndUpdate(id, { status: InvoiceStatus.CANCELLED }, { new: true });

    if (!invoice) throw new Error('Không tìm thấy hóa đơn để hủy');
    return invoice;
  }

  async generateInvoiceCode(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();

    const lastInvoice = await InvoiceModel.findOne({
      code: new RegExp(`^INV-${year}-`),
    }).sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastInvoice && lastInvoice.code) {
      const lastCodeParts = lastInvoice.code.split('-');
      const lastNumber = parseInt(lastCodeParts[lastCodeParts.length - 1], 10);

      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const formattedNumber = nextNumber.toString().padStart(3, '0');
    return `INV-${year}-${formattedNumber}`;
  }

  async setupInstallment(invoiceId: string, data: { totalMonths: number }) {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) throw new Error('Không tìm thấy hóa đơn');

    if (invoice.status === 'PAID') {
      throw new Error('Hóa đơn đã thanh toán xong, không thể trả góp');
    }
    if (invoice.installmentConfig && invoice.installmentConfig.totalMonths > 0) {
      throw new Error('Hóa đơn này đã được thiết lập trả góp từ trước');
    }

    const amountPerMonth = Math.ceil(invoice.debt / data.totalMonths);

    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      {
        $set: {
          installmentConfig: {
            totalMonths: data.totalMonths,
            amountPerMonth: amountPerMonth,
          },
          status: 'PARTIAL',
        },
      },
      { new: true },
    )
      .populate('studentId', 'fullName email phone')
      .populate('classId', 'name');

    return updatedInvoice;
  }
}
