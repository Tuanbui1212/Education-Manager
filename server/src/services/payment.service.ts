import { VNPay, ignoreLogger, ProductCode, VnpLocale, HashAlgorithm } from 'vnpay';
import { InvoiceModel } from '../models/invoice.model';
import { TransactionModel } from '../models/transaction.model';
import { InvoiceStatus } from '../types/invoice.type';
import { PaymentMethod } from '../types/transaction.type';

export class PaymentService {
  private vnpayInstance: VNPay;

  constructor() {
    this.vnpayInstance = new VNPay({
      tmnCode: process.env.VNP_TMN_CODE!,
      secureSecret: process.env.VNP_HASH_SECRET!,
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: true,
      hashAlgorithm: 'SHA512' as HashAlgorithm,
      loggerFn: ignoreLogger,
    });
  }

  // 1. Tạo Link thanh toán toàn bộ
  async generateVnpayUrl(invoiceId: string, ipAddr: string, bankCode?: string): Promise<string> {
    const invoice = await InvoiceModel.findById(invoiceId).lean();

    if (!invoice) throw new Error('Không tìm thấy hóa đơn!');
    if (invoice.status === InvoiceStatus.PAID) throw new Error('Hóa đơn này đã thanh toán xong!');
    if (invoice.debt <= 0) throw new Error('Hóa đơn này không còn nợ!');

    const paymentUrl = this.vnpayInstance.buildPaymentUrl({
      vnp_Amount: invoice.debt,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: `${invoice._id.toString()}_FULL_${Date.now()}`,
      vnp_OrderInfo: `Thanh toan hoc phi hoa don: ${invoice.code}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL!,
      vnp_Locale: VnpLocale.VN,
      ...(bankCode && { vnp_BankCode: bankCode }),
    });

    console.log(`[VNPAY] Generated payment URL for Invoice ${invoice.code}: ${JSON.stringify(paymentUrl)}`);

    return paymentUrl;
  }

  async generateVnpayUrlForInstallment(invoiceId: string, ipAddr: string, bankCode?: string): Promise<string> {
    const invoice = await InvoiceModel.findById(invoiceId).lean();

    if (!invoice) throw new Error('Không tìm thấy hóa đơn!');
    if (invoice.status === InvoiceStatus.PAID) throw new Error('Hóa đơn này đã thanh toán xong!');
    if (!invoice.installmentConfig) throw new Error('Hóa đơn này không phải là hóa đơn trả góp!');

    const paymentUrl = this.vnpayInstance.buildPaymentUrl({
      vnp_Amount: invoice.installmentConfig.amountPerMonth,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: `${invoice._id.toString()}_INST_${Date.now()}`,
      vnp_OrderInfo: `Thanh toan hoc phi hoa don: ${invoice.code}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL!,
      vnp_Locale: VnpLocale.VN,
      ...(bankCode && { vnp_BankCode: bankCode }),
    });

    console.log(`[VNPAY] Generated payment URL for Installment Invoice ${invoice.code}: ${JSON.stringify(paymentUrl)}`);

    return paymentUrl;
  }

  // 2. Xử lý IPN Webhook (Quan trọng: Tương tác với cả 2 Model)
  async handleVnpayIpn(query: any) {
    try {
      console.log('--- [VNPAY IPN GỌI ĐẾN] ---', query);
      const verifyResult = this.vnpayInstance.verifyIpnCall(query);
      if (!verifyResult.isSuccess) return { RspCode: '97', Message: 'Fail checksum' };

      const invoiceId = query.vnp_TxnRef.split('_')[0];
      const rspCode = query.vnp_ResponseCode;
      const paidAmount = Number(query.vnp_Amount) / 100;

      const invoice = await InvoiceModel.findById(invoiceId);
      if (!invoice) return { RspCode: '01', Message: 'Invoice not found' };
      if (invoice.status === InvoiceStatus.PAID) return { RspCode: '02', Message: 'Invoice already paid' };

      const expectedAmount =
        invoice.installmentConfig && paidAmount === invoice.installmentConfig.amountPerMonth
          ? invoice.installmentConfig.amountPerMonth
          : invoice.debt;

      if (paidAmount !== expectedAmount) {
        return { RspCode: '04', Message: 'Invalid amount' };
      }

      // Giao dịch thành công
      if (rspCode === '00') {
        const newDebt = invoice.debt - paidAmount;

        // ==========================================
        // BƯỚC A: TẠO GIAO DỊCH (LƯU VẾT LỊCH SỬ)
        // ==========================================
        const year = new Date().getFullYear();
        const lastTx = await TransactionModel.findOne({ code: new RegExp(`^PT-${year}-`) }).sort({ createdAt: -1 });
        let nextNumber = 1;
        if (lastTx && lastTx.code) {
          const parts = lastTx.code.split('-');
          nextNumber = parseInt(parts[parts.length - 1], 10) + 1;
        }
        const code = `PT-${year}-${nextNumber.toString().padStart(4, '0')}`;
        await TransactionModel.create({
          code: code,
          invoiceId: invoice._id,
          studentId: invoice.studentId,
          amount: paidAmount,
          paymentMethod: PaymentMethod.VNPAY,
          note: `Thanh toán qua VNPAY (Ngân hàng: ${query.vnp_BankCode})`,
          processedBy: invoice.studentId,
        });

        // ==========================================
        // BƯỚC B: XỬ LÝ CÔNG NỢ & TRẠNG THÁI GỘP CHUNG
        // ==========================================

        invoice.debt = newDebt < 0 ? 0 : newDebt;
        invoice.status = invoice.debt === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;

        if (invoice.debt > 0 && invoice.installmentConfig && invoice.installmentConfig.totalMonths > 0) {
          invoice.installmentConfig.paidMonths = (invoice.installmentConfig.paidMonths || 0) + 1;
          const baseDate = invoice.installmentConfig.nextDueDate
            ? new Date(invoice.installmentConfig.nextDueDate)
            : new Date();

          baseDate.setDate(baseDate.getDate() + 30);
          invoice.installmentConfig.nextDueDate = baseDate;
        }

        await invoice.save();

        console.log(`[VNPAY] Hóa đơn ${invoice.code} thu thành công ${paidAmount}đ`);
      }

      return { RspCode: '00', Message: 'Confirm Success' };
    } catch (error) {
      console.error('Lỗi khi xử lý IPN:', error);
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }
}
