import React, { useState } from 'react';
import { CheckCircle2, Banknote, CreditCard, User, ArrowLeft, X, AlertCircle, Send, QrCode } from 'lucide-react';
import { formatCurrency } from '../../../utils/format.util';
import type { IInvoice, InvoiceStatus, InvoiceConfig } from '../../../types/invoice.type';
import { invoiceService } from '../../../services/invoice.service';
import { transactionService } from '../../../services/transaction.service';
import { getDecodedToken } from '../../../utils/auth';

interface PaymentWizardModalProps {
  invoice: IInvoice;
  onClose: () => void;
  onSuccess: (id: string, newDebt: number, newStatus: InvoiceStatus, newConfig?: InvoiceConfig) => void;
}

const PaymentWizardModal: React.FC<PaymentWizardModalProps> = ({ invoice, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [months, setMonths] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('TRANSFER');

  // Lấy ID người dùng hiện tại từ Token để lưu làm người xử lý
  const currentUserId = getDecodedToken()?.id || '';
  const currentUserFullName = getDecodedToken()?.name || 'Tôi';

  console.log(currentUserId);

  const paidAmount = (invoice?.finalAmount || 0) - (invoice?.debt || 0);
  const isExistingInstallment = invoice?.status === 'PARTIAL' && invoice?.installmentConfig;

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
      // LUỒNG 1: THÔNG BÁO (KHÔNG TẠO GIAO DỊCH)
      if (action === 'notify_full') {
        setMessage('Đã gửi yêu cầu thanh toán toàn bộ kèm Mã QR Online thành công.');
        setStep(4);
      } else if (action === 'installment_email') {
        const res = await invoiceService.setupInstallment(invoice._id as string, { totalMonths: months });
        if (res.success) {
          setMessage(`Đã chuyển sang trả góp ${months} kỳ và gửi Email lịch thu.`);
          onSuccess(invoice._id as string, invoice.debt, 'PARTIAL', res.data?.installmentConfig);
          setStep(4);
        }
      } else if (action === 'notify_next_period') {
        const amountToPay = invoice.installmentConfig
          ? Math.min(invoice.installmentConfig.amountPerMonth, invoice.debt)
          : 0;
        setMessage(`Đã gửi nhắc hẹn thanh toán kỳ tiếp theo (${formatCurrency(amountToPay)}) qua Email/Zalo.`);
        setStep(4);
      }

      // LUỒNG 2: THU TIỀN TRỰC TIẾP (TỰ ĐỘNG TRUYỀN currentUserId)
      else if (action === 'full' || action === 'pay_off_all') {
        const res = await transactionService.createTransaction({
          invoiceId: invoice._id as string,
          amount: invoice.debt,
          paymentMethod: paymentMethod,
          processedBy: currentUserId, // Mặc định lấy từ Token
          note: action === 'pay_off_all' ? 'Tất toán trả góp' : 'Thu thẳng toàn bộ',
        });
        if (res.success) {
          setMessage('Đã thu toàn bộ công nợ thành công.');
          onSuccess(invoice._id as string, 0, 'PAID');
          setStep(4);
        }
      } else if (action === 'installment_cash') {
        const setupRes = await invoiceService.setupInstallment(invoice._id as string, { totalMonths: months });
        const newConfig = setupRes.data?.installmentConfig;
        const amountPerMonth = newConfig ? newConfig.amountPerMonth : Math.ceil(invoice.debt / months);

        const txRes = await transactionService.createTransaction({
          invoiceId: invoice._id as string,
          amount: amountPerMonth,
          paymentMethod: paymentMethod,
          processedBy: currentUserId,
          note: `Thu tiền trả góp Kỳ 1`,
        });

        if (txRes.success) {
          setMessage(`Đã tạo lịch trả góp và thu thành công Kỳ 1: ${formatCurrency(amountPerMonth)}`);
          onSuccess(invoice._id as string, invoice.debt - amountPerMonth, 'PARTIAL', newConfig);
          setStep(4);
        }
      } else if (action === 'pay_next_period') {
        const amountToPay = invoice.installmentConfig
          ? Math.min(invoice.installmentConfig.amountPerMonth, invoice.debt)
          : 0;
        const res = await transactionService.createTransaction({
          invoiceId: invoice._id as string,
          amount: amountToPay,
          paymentMethod: paymentMethod,
          processedBy: currentUserId,
          note: 'Thu tiền trả góp định kỳ',
        });

        if (res.success) {
          const newDebt = invoice.debt - amountToPay;
          setMessage(`Đã thu thành công kỳ tiếp theo: ${formatCurrency(amountToPay)}`);
          onSuccess(invoice._id as string, newDebt, newDebt <= 0 ? 'PAID' : 'PARTIAL', invoice.installmentConfig);
          setStep(4);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setIsLoading(false);
    }
  };

  // Component chọn Phương thức thanh toán (Giữ lại vì cần biết Tiền mặt hay Chuyển khoản)
  const PaymentMethodSelector = () => (
    <div className="animate-in slide-in-from-bottom-4">
      <p className="text-sm font-semibold text-gray-700 mb-2">Phương thức thanh toán:</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setPaymentMethod('TRANSFER')}
          className={`p-3 rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition-all ${
            paymentMethod === 'TRANSFER'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <CreditCard size={18} /> Chuyển khoản
        </button>
        <button
          onClick={() => setPaymentMethod('CASH')}
          className={`p-3 rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition-all ${
            paymentMethod === 'CASH'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Banknote size={18} /> Tiền mặt
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="bg-gray-50 p-5 sm:p-6 flex justify-between items-center border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Xử lý Giao dịch</h2>
            <p className="text-sm text-gray-500 mt-1">
              Hệ thống ghi nhận người thu: <span className="font-semibold text-blue-600">{currentUserFullName}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar">
          {step !== 4 && (
            <div className="mb-6 flex flex-col sm:flex-row gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="flex-1">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Học viên</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <User size={16} className="text-blue-500" />
                  {(invoice?.studentId as any)?.fullName || 'Chưa cập nhật'}
                </p>
                <p className="text-sm text-gray-500 mt-1">{(invoice?.classId as any)?.name || 'Chưa phân lớp'}</p>
              </div>
              <div className="hidden sm:block w-px bg-blue-200 mx-2"></div>
              <div className="flex-1 sm:text-center">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Đã Thanh Toán</p>
                <p className="font-bold text-lg text-emerald-600">{formatCurrency(paidAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">/ {formatCurrency(invoice?.finalAmount || 0)}</p>
              </div>
              <div className="hidden sm:block w-px bg-blue-200 mx-2"></div>
              <div className="flex-1 sm:text-right">
                <p className="text-xs text-red-600 font-bold uppercase mb-1">Công Nợ Hiện Tại</p>
                <p className="font-bold text-2xl text-red-600">{formatCurrency(invoice?.debt || 0)}</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4">
              {isExistingInstallment ? (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                  <div className="flex items-center gap-2 text-amber-800 mb-2">
                    <AlertCircle size={20} />
                    <h3 className="font-bold text-lg">Đang trả góp ({invoice.installmentConfig?.totalMonths} kỳ)</h3>
                  </div>
                  <p className="text-amber-700 mb-5">
                    Số tiền thu kỳ này:{' '}
                    <span className="font-bold text-xl">
                      {formatCurrency(Math.min(invoice.installmentConfig!.amountPerMonth, invoice.debt))}
                    </span>
                  </p>

                  <button
                    onClick={() => handleProcess('notify_next_period')}
                    className="w-full mb-5 p-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <QrCode size={20} /> Gửi thông báo & QR thanh toán kỳ này
                  </button>

                  <div className="relative py-3 mb-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-amber-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-amber-50 px-4 text-sm text-amber-600 font-medium">
                        Thu trực tiếp tại quầy
                      </span>
                    </div>
                  </div>

                  <div className="mb-5">
                    <PaymentMethodSelector />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleProcess('pay_next_period')}
                      className="p-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-2"
                    >
                      <Banknote size={24} /> Thu kỳ tiếp theo
                    </button>
                    <button
                      onClick={() => handleProcess('pay_off_all')}
                      className="p-4 border-2 border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl font-bold flex flex-col items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={24} /> Tất toán toàn bộ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center group transition-all"
                  >
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110">
                      <CreditCard size={32} />
                    </div>
                    <span className="font-bold text-gray-800">Thu toàn bộ ({formatCurrency(invoice.debt)})</span>
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="p-6 border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 flex flex-col items-center group transition-all"
                  >
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110">
                      <Banknote size={32} />
                    </div>
                    <span className="font-bold text-gray-800">Thiết lập Trả góp</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-800"
              >
                <ArrowLeft size={16} /> Quay lại
              </button>
              <button
                onClick={() => handleProcess('notify_full')}
                className="w-full p-4 bg-emerald-100 text-emerald-700 rounded-xl font-bold flex justify-center items-center gap-3"
              >
                <QrCode size={24} /> Gửi yêu cầu Online
              </button>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-400">Hoặc thu trực tiếp</span>
                </div>
              </div>
              <PaymentMethodSelector />
              <button
                onClick={() => handleProcess('full')}
                className="w-full p-5 bg-blue-600 text-white rounded-2xl font-bold text-lg flex justify-center items-center gap-3"
              >
                <Banknote size={24} /> Xác nhận thu đủ {formatCurrency(invoice.debt)}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-800"
              >
                <ArrowLeft size={16} /> Quay lại
              </button>
              <div className="bg-indigo-50 p-5 rounded-2xl text-center border border-indigo-100">
                <p className="font-semibold text-indigo-800 mb-3">Chia thành mấy kỳ?</p>
                <div className="flex justify-center gap-3 mb-4">
                  {[3, 6, 12].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMonths(m)}
                      className={`px-6 py-2 rounded-xl font-bold transition-all ${months === m ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border'}`}
                    >
                      {m} Kỳ
                    </button>
                  ))}
                </div>
                <p className="text-gray-600">
                  Số tiền mỗi kỳ:{' '}
                  <span className="font-bold text-indigo-700">{formatCurrency(Math.ceil(invoice.debt / months))}</span>
                </p>
              </div>
              <button
                onClick={() => handleProcess('installment_email')}
                className="w-full p-4 bg-emerald-100 text-emerald-700 rounded-xl font-bold flex justify-center items-center gap-2"
              >
                <Send size={20} /> Chỉ gửi lịch thu
              </button>
              <PaymentMethodSelector />
              <button
                onClick={() => handleProcess('installment_cash')}
                className="w-full p-4 bg-indigo-600 text-white rounded-xl font-bold shadow-md flex justify-center items-center gap-2"
              >
                <Banknote size={20} /> Thu Kỳ 1 Trực Tiếp
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-10 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Giao dịch thành công!</h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">{message}</p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentWizardModal;
