import React, { useState } from 'react';
import {
  CheckCircle2,
  Banknote,
  CreditCard,
  User,
  ArrowLeft,
  X,
  AlertCircle,
  Send,
  QrCode,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/format.util';
import type { IInvoice, InvoiceStatus, InvoiceConfig } from '../../../types/invoice.type';
import { invoiceService } from '../../../services/invoice.service';
import { transactionService } from '../../../services/transaction.service';
import { getDecodedToken } from '../../../utils/auth';

interface PaymentWizardModalProps {
  invoice: IInvoice;
  onClose: () => void;
  onSuccess: (
    id: string,
    newDebt: number,
    newStatus: InvoiceStatus,
    newConfig?: InvoiceConfig,
    newRemindCount?: number,
    newLastRemindedAt?: string,
  ) => void;
}

const PaymentWizardModal: React.FC<PaymentWizardModalProps> = ({ invoice, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [months, setMonths] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('TRANSFER');

  const currentUserId = getDecodedToken()?.id || '';
  const currentUserFullName = getDecodedToken()?.name || 'Tôi';

  const paidAmount = (invoice?.finalAmount || 0) - (invoice?.debt || 0);
  const isExistingInstallment = invoice?.status === 'PARTIAL' && invoice?.installmentConfig;

  const lastRemindedDate = invoice?.lastRemindedAt ? new Date(invoice.lastRemindedAt) : null;
  const now = new Date();
  const daysSinceLastRemind = lastRemindedDate
    ? (now.getTime() - lastRemindedDate.getTime()) / (1000 * 3600 * 24)
    : null;

  const canRemind = daysSinceLastRemind === null || daysSinceLastRemind >= 5;
  const remindBlockMessage = !canRemind ? `Chỉ có thể gửi lại sau ${Math.ceil(5 - daysSinceLastRemind!)} ngày` : '';

  const handleProcess = async (
    action:
      | 'full'
      | 'notify_full'
      | 'installment_email'
      | 'installment_cash'
      | 'pay_next_period'
      | 'notify_next_period'
      | 'pay_off_all',
  ) => {
    setIsLoading(true);

    try {
      if (action === 'notify_full') {
        const res = await invoiceService.markAsNotified(invoice._id as string, false);

        const updatedInvoice = res?.data as IInvoice;
        const updatedRemindCount = updatedInvoice?.remindCount || (invoice.remindCount || 0) + 1;
        const rawDate = updatedInvoice?.lastRemindedAt;
        const updatedLastRemindedAt = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

        setMessage('Hệ thống đã gửi thông báo yêu cầu thanh toán toàn bộ công nợ qua Email.');
        onSuccess(
          invoice._id as string,
          invoice.debt,
          invoice.status,
          invoice.installmentConfig,
          updatedRemindCount,
          updatedLastRemindedAt,
        );
        setStep(4);
      } else if (action === 'notify_next_period') {
        const res = await invoiceService.markAsNotified(invoice._id as string, true);

        const updatedInvoice = res?.data as IInvoice;
        const updatedRemindCount = updatedInvoice?.remindCount || (invoice.remindCount || 0) + 1;
        const rawDate = updatedInvoice?.lastRemindedAt;
        const updatedLastRemindedAt = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

        setMessage('Hệ thống đã gửi thông báo nhắc nợ trả góp kỳ này qua Email.');
        onSuccess(
          invoice._id as string,
          invoice.debt,
          invoice.status,
          invoice.installmentConfig,
          updatedRemindCount,
          updatedLastRemindedAt,
        );
        setStep(4);
      } else if (action === 'installment_email') {
        const res = await invoiceService.setupInstallment(invoice._id as string, { totalMonths: months });
        if (res.success) {
          setMessage(`Đã chuyển trạng thái trả góp ${months} kỳ. Email lịch trình thanh toán đã được gửi.`);
          onSuccess(invoice._id as string, invoice.debt, 'PARTIAL', res.data?.installmentConfig);
          setStep(4);
        }
      } else if (action === 'full' || action === 'pay_off_all') {
        const res = await transactionService.createTransaction({
          invoiceId: invoice._id as string,
          amount: invoice.debt,
          paymentMethod: paymentMethod,
          processedBy: currentUserId,
          note: action === 'pay_off_all' ? 'Tất toán toàn bộ nợ trả góp' : 'Thu tiền thanh toán toàn bộ hóa đơn',
        });
        if (res.success) {
          setMessage('Xác nhận thu toàn bộ công nợ thành công.');
          onSuccess(invoice._id as string, 0, 'PAID');
          setStep(4);
        }
      }

      // 5. THIẾT LẬP TRẢ GÓP VÀ THU LUÔN KỲ 1
      else if (action === 'installment_cash') {
        const setupRes = await invoiceService.setupInstallment(invoice._id as string, { totalMonths: months });
        const newConfig = setupRes.data?.installmentConfig;
        const amountPerMonth = newConfig ? newConfig.amountPerMonth : Math.ceil(invoice.debt / months);

        const txRes = await transactionService.createTransaction({
          invoiceId: invoice._id as string,
          amount: amountPerMonth,
          paymentMethod: paymentMethod,
          processedBy: currentUserId,
          note: `Thanh toán trả góp - Kỳ 1/${months}`,
        });

        if (txRes.success) {
          setMessage(`Đã thiết lập trả góp và thu thành công Kỳ 1: ${formatCurrency(amountPerMonth)}`);
          onSuccess(invoice._id as string, invoice.debt - amountPerMonth, 'PARTIAL', newConfig);
          setStep(4);
        }
      }

      // 6. THU TIỀN KỲ TIẾP THEO CỦA TRẢ GÓP
      else if (action === 'pay_next_period') {
        const amountToPay = invoice.installmentConfig
          ? Math.min(invoice.installmentConfig.amountPerMonth, invoice.debt)
          : 0;
        const res = await transactionService.createTransaction({
          invoiceId: invoice._id as string,
          amount: amountToPay,
          paymentMethod: paymentMethod,
          processedBy: currentUserId,
          note: `Thanh toán trả góp - Kỳ ${(invoice.installmentConfig?.paidMonths || 0) + 1}`,
        });

        if (res.success) {
          const newDebt = invoice.debt - amountToPay;

          const newConfig = res.data?.updatedConfig || invoice.installmentConfig;

          setMessage(`Đã thu thành công kỳ tiếp theo: ${formatCurrency(amountToPay)}`);

          onSuccess(invoice._id as string, newDebt, newDebt <= 0 ? 'PAID' : 'PARTIAL', newConfig);
          setStep(4);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể xử lý giao dịch. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const PaymentMethodSelector = () => (
    <div className="animate-in slide-in-from-bottom-2">
      <p className="text-sm font-semibold text-gray-700 mb-2 italic">Chọn phương thức thu tiền:</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          disabled={isLoading}
          onClick={() => setPaymentMethod('TRANSFER')}
          className={`p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'TRANSFER'
              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
              : 'border-gray-200 text-gray-400 hover:bg-gray-50'
            }`}
        >
          <CreditCard size={18} /> Chuyển khoản
        </button>
        <button
          disabled={isLoading}
          onClick={() => setPaymentMethod('CASH')}
          className={`p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'CASH'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
              : 'border-gray-200 text-gray-400 hover:bg-gray-50'
            }`}
        >
          <Banknote size={18} /> Tiền mặt
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative">
        {/* Overlay Loading chặn mọi thao tác */}
        {isLoading && (
          <div className="absolute inset-0 z- bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in">
            <Loader2 size={60} className="text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-800">Đang đồng bộ dữ liệu...</h3>
            <p className="text-gray-500 mt-1">Hệ thống đang gửi yêu cầu và ghi nhận lịch sử</p>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-gray-50 p-6 flex justify-between items-center border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
              Quản lý Công nợ & Giao dịch
              {invoice?.lastRemindedAt && (
                <span className="text-[10px] font-bold px-3 py-1 bg-amber-500 text-white rounded-full uppercase tracking-tighter">
                  Đã nhắc: {invoice.remindCount} lần
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Người thực hiện: <span className="font-bold text-blue-600">{currentUserFullName}</span>
            </p>
          </div>
          <button
            disabled={isLoading}
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors disabled:opacity-30"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
          {step !== 4 && (
            <div className="mb-8 flex flex-col sm:flex-row gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-inner">
              <div className="flex-1">
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">Học viên / Lớp</p>
                <p className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                  <User size={18} className="text-blue-500" />
                  {(invoice?.studentId as any)?.fullName || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 italic mt-0.5">
                  {(invoice?.classId as any)?.name || 'Chưa xếp lớp'}
                </p>
              </div>
              <div className="hidden sm:block w-px bg-blue-200"></div>
              <div className="flex-1 sm:text-center">
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">
                  Thanh toán (Tạm tính)
                </p>
                <p className="font-bold text-xl text-emerald-600">{formatCurrency(paidAmount)}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Tổng: {formatCurrency(invoice?.finalAmount || 0)}</p>
              </div>
              <div className="hidden sm:block w-px bg-blue-200"></div>
              <div className="flex-1 sm:text-right">
                <p className="text-[10px] text-red-600 font-black uppercase tracking-widest mb-1">Công nợ cần thu</p>
                <p className="font-black text-3xl text-red-600 drop-shadow-sm">{formatCurrency(invoice?.debt || 0)}</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-bottom-5">
              {isExistingInstallment ? (
                <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 text-amber-800 mb-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-lg uppercase tracking-tight">Hóa đơn đang trả góp</h3>
                      <div className="mt-1">
                        <p className="text-sm font-black text-amber-700">
                          Tiến độ: Đã thu {invoice.installmentConfig?.paidMonths || 0} /{' '}
                          {invoice.installmentConfig?.totalMonths} kỳ
                        </p>
                        <p className="text-xs font-medium mt-1 text-amber-600 bg-amber-100/50 inline-block px-2 py-1 rounded">
                          Đang chờ thu Kỳ {(invoice.installmentConfig?.paidMonths || 0) + 1}
                          {invoice.installmentConfig?.nextDueDate &&
                            ` (Hạn chót: ${new Date(invoice.installmentConfig.nextDueDate).toLocaleDateString('vi-VN')})`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-amber-200 mb-6">
                    <p className="text-xs text-gray-500 mb-1">Số tiền định kỳ kỳ này:</p>
                    <p className="font-black text-2xl text-amber-600">
                      {formatCurrency(Math.min(invoice.installmentConfig!.amountPerMonth, invoice.debt))}
                    </p>
                  </div>

                  <button
                    disabled={isLoading || !canRemind}
                    onClick={() => handleProcess('notify_next_period')}
                    className={`w-full mb-6 p-4 rounded-xl font-black flex items-center justify-center gap-3 shadow-sm transition-all active:scale-[0.98] ${canRemind
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <QrCode size={20} />
                    {canRemind ? 'GỬI THÔNG BÁO NHẮC NỢ KỲ NÀY' : remindBlockMessage}
                  </button>

                  <div className="relative py-4 mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-amber-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-amber-50 px-4 text-xs text-amber-600 font-bold uppercase">
                        Xác nhận thu tiền tại quầy
                      </span>
                    </div>
                  </div>

                  <PaymentMethodSelector />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <button
                      disabled={isLoading}
                      onClick={() => handleProcess('pay_next_period')}
                      className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                    >
                      <Banknote size={24} /> Thu tiền Kỳ {(invoice.installmentConfig?.paidMonths || 0) + 1}
                    </button>
                    <button
                      disabled={isLoading}
                      onClick={() => handleProcess('pay_off_all')}
                      className="p-4 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 size={24} /> Tất toán tất cả
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button
                    disabled={isLoading}
                    onClick={() => setStep(2)}
                    className="p-8 border-2 border-gray-100 rounded-3xl hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center group transition-all shadow-sm disabled:opacity-50"
                  >
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <CreditCard size={40} />
                    </div>
                    <span className="font-black text-gray-800 text-lg">THANH TOÁN ĐỦ</span>
                    <span className="text-sm text-gray-500 mt-1 uppercase tracking-tighter">
                      Thu 100% công nợ hiện tại
                    </span>
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={() => setStep(3)}
                    className="p-8 border-2 border-gray-100 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50 flex flex-col items-center group transition-all shadow-sm disabled:opacity-50"
                  >
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Banknote size={40} />
                    </div>
                    <span className="font-black text-gray-800 text-lg">CHIA TRẢ GÓP</span>
                    <span className="text-sm text-gray-500 mt-1 uppercase tracking-tighter">
                      Hỗ trợ đóng tiền định kỳ
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-5">
              <button
                disabled={isLoading}
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 flex items-center gap-2 hover:text-gray-800 font-bold"
              >
                <ArrowLeft size={18} /> QUAY LẠI
              </button>

              <button
                disabled={isLoading || !canRemind}
                onClick={() => handleProcess('notify_full')}
                className={`w-full p-5 rounded-2xl font-black flex justify-center items-center gap-3 transition-all shadow-md ${canRemind
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <QrCode size={24} />
                {canRemind ? 'GỬI THÔNG BÁO NHẮC NỢ' : remindBlockMessage}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-6 text-xs text-gray-400 font-black uppercase tracking-widest">
                    Hoặc xác nhận thu trực tiếp
                  </span>
                </div>
              </div>

              <PaymentMethodSelector />

              <button
                disabled={isLoading}
                onClick={() => handleProcess('full')}
                className="w-full p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl flex justify-center items-center gap-4 shadow-xl transition-all active:scale-[0.98] disabled:bg-blue-400"
              >
                <Banknote size={28} /> XÁC NHẬN ĐÃ THU {formatCurrency(invoice.debt)}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-5">
              <button
                disabled={isLoading}
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 flex items-center gap-2 hover:text-gray-800 font-bold"
              >
                <ArrowLeft size={18} /> QUAY LẠI
              </button>

              <div className="bg-indigo-50 p-6 rounded-3xl text-center border-2 border-indigo-100 shadow-inner">
                <p className="font-black text-indigo-800 mb-4 uppercase tracking-tighter text-lg">
                  Thiết lập số kỳ thanh toán
                </p>
                <div className="flex justify-center gap-4 mb-6">
                  {[3, 6, 9, 12].map((m) => (
                    <button
                      key={m}
                      disabled={isLoading}
                      onClick={() => setMonths(m)}
                      className={`w-16 h-16 rounded-2xl font-black transition-all border-2 ${months === m
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg scale-110'
                          : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-300'
                        }`}
                    >
                      {m}K
                    </button>
                  ))}
                </div>
                <div className="bg-white p-4 rounded-xl border border-indigo-100 inline-block">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Số tiền mỗi kỳ:</p>
                  <p className="font-black text-2xl text-indigo-700">
                    {formatCurrency(Math.ceil(invoice.debt / months))}
                  </p>
                </div>
              </div>

              <button
                disabled={isLoading}
                onClick={() => handleProcess('installment_email')}
                className="w-full p-4 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-2xl font-black flex justify-center items-center gap-3 transition-all shadow-sm"
              >
                <Send size={22} /> CHỈ THIẾT LẬP VÀ GỬI LỊCH HẸN
              </button>

              <div className="py-2">
                <PaymentMethodSelector />
              </div>

              <button
                disabled={isLoading}
                onClick={() => handleProcess('installment_cash')}
                className="w-full p-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl flex justify-center items-center gap-3 transition-all active:scale-[0.98] disabled:bg-indigo-400"
              >
                <Banknote size={24} /> THU KỲ 1 & KÍCH HOẠT LỊCH TRẢ GÓP
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-12 animate-in zoom-in-95">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                <CheckCircle2 size={56} />
              </div>
              <h3 className="text-3xl font-black text-gray-800 mb-3 tracking-tighter">HOÀN TẤT GIAO DỊCH</h3>
              <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">{message}</p>
              <button
                onClick={onClose}
                className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all active:scale-95 shadow-lg uppercase tracking-widest"
              >
                XÁC NHẬN & ĐÓNG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentWizardModal;
