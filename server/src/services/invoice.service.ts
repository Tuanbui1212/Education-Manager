import { InvoiceModel } from '../models/invoice.model';
import { InvoiceStatus } from '../types/invoice.type';
import type { IInvoice, CreateInvoiceType } from '../types/invoice.type';
import { EmailService } from './email.service';

export class InvoiceService {
  private emailService = new EmailService();

  // Tạo hóa đơn mới
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

  // Lấy danh sách hóa đơn với phân trang và lọc
  async getInvoices(query: any) {
    const { page = 1, limit = 10, status, search, minDebt, maxDebt, dueDateFrom, dueDateTo } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.code = { $regex: search, $options: 'i' };
    }

    if (minDebt || maxDebt) {
      filter.debt = {};
      if (minDebt) filter.debt.$gte = Number(minDebt);
      if (maxDebt) filter.debt.$lte = Number(maxDebt);
    }

    if (dueDateFrom || dueDateTo) {
      filter.dueDate = {};
      if (dueDateFrom) filter.dueDate.$gte = new Date(dueDateFrom);
      if (dueDateTo) filter.dueDate.$lte = new Date(dueDateTo);
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

  // Lấy danh sách hóa đơn của một học viên
  async getInvoicesByStudentId(studentId: string, query: any) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { studentId };
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

  // Lấy chi tiết hóa đơn
  async getInvoiceById(id: string) {
    const invoice = await InvoiceModel.findById(id)
      .populate('studentId', 'fullName email phone')
      .populate('classId', 'name')
      .populate('consultantId', 'fullName');

    if (!invoice) throw new Error('Không tìm thấy hóa đơn');
    return invoice;
  }

  // Cập nhật hóa đơn
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

  // Hủy hóa đơn
  async deleteInvoice(id: string) {
    const invoice = await InvoiceModel.findByIdAndUpdate(id, { status: InvoiceStatus.CANCELLED }, { new: true });

    if (!invoice) throw new Error('Không tìm thấy hóa đơn để hủy');
    return invoice;
  }

  // Tạo mã hóa đơn mới theo định dạng INV-{NĂM}-{SỐ THỨ TỰ 3 CHỮ SỐ}
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

  // Thiết lập trả góp cho hóa đơn
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

    const finalDueDate = new Date();
    const extraDays = (data.totalMonths - 1) * 30;
    finalDueDate.setDate(finalDueDate.getDate() + extraDays);

    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      {
        $set: {
          installmentConfig: {
            totalMonths: data.totalMonths,
            amountPerMonth: amountPerMonth,
            paidMonths: 0,
            nextDueDate: new Date(),
          },
          dueDate: finalDueDate,
          status: 'PARTIAL',
        },
      },
      { new: true },
    )
      .populate('studentId', 'fullName email phone')
      .populate('classId', 'name');

    const student = updatedInvoice?.studentId as any;

    // 2. GỬI EMAIL THÔNG BÁO LỊCH TRẢ GÓP
    if (student && student.email) {
      const emailPayload = {
        studentName: student.fullName || 'Học viên',
        invoiceCode: updatedInvoice?.code,
        debtAmount: updatedInvoice?.debt,
        totalMonths: data.totalMonths,
        amountPerMonth: amountPerMonth,
      };

      this.emailService.sendEmailWithTemplate(student.email, 'INSTALLMENT_CREATED', emailPayload).catch((err) => {
        console.error(`[Lỗi gửi mail Trả góp]: ${err.message}`);
      });
    }

    return updatedInvoice;
  }

  async markAsNotified(id: string, isInstallment: boolean = false) {
    const invoice = await InvoiceModel.findById(id)
      .populate('studentId', 'fullName email phone')
      .populate('classId', 'name')
      .populate('consultantId', 'fullName');

    if (!invoice) {
      throw new Error('Không tìm thấy hóa đơn');
    }

    if (invoice.lastRemindedAt) {
      const minInterval = 5 * 24 * 60 * 60 * 1000;
      const timeSinceLast = Date.now() - new Date(invoice.lastRemindedAt).getTime();

      if (timeSinceLast < minInterval) {
        const daysLeft = Math.ceil((minInterval - timeSinceLast) / (1000 * 60 * 60 * 24));
        throw new Error(`Vui lòng chờ ${daysLeft} ngày nữa để nhắc tiếp.`);
      }
    }

    invoice.remindCount = (invoice.remindCount || 0) + 1;
    invoice.lastRemindedAt = new Date();
    await invoice.save();

    const student = invoice.studentId as any;
    let isEmailSent = false;

    if (student && student.email) {
      let templateCode = 'REMIND_DEBT';
      let amountToRemind = invoice.debt;

      if (isInstallment && invoice.installmentConfig) {
        templateCode = 'REMIND_INSTALLMENT';
        amountToRemind = Math.min(invoice.installmentConfig.amountPerMonth, invoice.debt);
      }

      const emailPayload = {
        studentName: student.fullName || 'Học viên',
        invoiceCode: invoice.code,
        debtAmount: amountToRemind,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('vi-VN') : 'Sớm nhất có thể',
      };

      isEmailSent = await this.emailService.sendEmailWithTemplate(student.email, templateCode, emailPayload);
    }

    return {
      invoice,
      emailSent: isEmailSent,
    };
  }
}
