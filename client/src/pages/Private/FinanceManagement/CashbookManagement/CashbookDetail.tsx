import React from 'react';
import {
  ArrowLeft,
  Printer,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  User,
  FileText,
  CreditCard,
  Calendar,
  Hash,
  Tag,
  BookOpen,
  Banknote,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Building2,
} from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import useFetch from '../../../../hooks/useFetch';
import { cashbookService } from '../../../../services/cashbook.service';

// ==================== HELPERS ====================

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const PAYMENT_LABELS: Record<string, string> = {
  CASH: 'Tiền mặt',
  TRANSFER: 'Chuyển khoản',
  CARD: 'Quẹt thẻ',
};

const INVOICE_STATUS_MAP = {
  UNPAID: { label: 'Chưa thanh toán', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', Icon: Clock },
  PARTIAL: { label: 'Thanh toán một phần', color: 'bg-blue-50 text-blue-700 border-blue-200', Icon: AlertCircle },
  PAID: { label: 'Đã thanh toán đủ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-500 border-gray-200', Icon: XCircle },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-red-50 text-red-600 border-red-200', Icon: RefreshCcw },
  OVERDUE: { label: 'Quá hạn', color: 'bg-rose-50 text-rose-700 border-rose-200', Icon: AlertCircle },
};

const TypeBadge = ({ type }: { type: 'IN' | 'OUT' | 'REFUND' }) => {
  if (type === 'IN')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
        <ArrowUpRight size={15} /> Phiếu Thu
      </span>
    );
  if (type === 'OUT')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-orange-50 text-orange-600 border border-orange-200">
        <ArrowDownRight size={15} /> Phiếu Chi
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-red-50 text-red-600 border border-red-200">
      <RefreshCcw size={15} /> Hoàn Tiền
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-gray-500" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  </div>
);

const StudentInvoiceCard = ({ student, invoice }: { student: any; invoice: any }) => {
  const statusInfo = INVOICE_STATUS_MAP[invoice.status as keyof typeof INVOICE_STATUS_MAP];
  const StatusIcon = statusInfo.Icon;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Student */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <User size={15} className="text-blue-600" />
          </div>
          <h4 className="font-bold text-gray-700 text-sm">Thông tin học viên</h4>
        </div>
        <div className="space-y-3">
          <InfoRow icon={User} label="Họ và tên" value={student.fullName} />
          <InfoRow icon={Hash} label="Email" value={student.email} />
          <InfoRow icon={Hash} label="Số điện thoại" value={student.phone} />
        </div>
      </div>

      {/* Invoice */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <FileText size={15} className="text-indigo-600" />
          </div>
          <h4 className="font-bold text-gray-700 text-sm">Hóa đơn liên quan</h4>
        </div>
        <div className="space-y-3">
          <InfoRow
            icon={Hash}
            label="Mã hóa đơn"
            value={<span className="font-mono text-blue-600">{invoice.code}</span>}
          />
          <InfoRow icon={BookOpen} label="Lớp học" value={invoice.classId?.name} />
          <InfoRow icon={Banknote} label="Tổng học phí" value={formatCurrency(invoice.finalAmount)} />
          <InfoRow
            icon={AlertCircle}
            label="Còn nợ"
            value={<span className="text-rose-600">{formatCurrency(invoice.debt)}</span>}
          />
          <InfoRow icon={Calendar} label="Hạn thanh toán" value={formatDate(invoice.dueDate)} />
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Trạng thái hóa đơn</p>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
              >
                <StatusIcon size={12} /> {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReceiverPayrollCard = ({ receiver, payroll }: { receiver: any; payroll: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Receiver */}
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
          <User size={15} className="text-violet-600" />
        </div>
        <h4 className="font-bold text-gray-700 text-sm">Nhân viên nhận lương</h4>
      </div>
      <div className="space-y-3">
        <InfoRow icon={User} label="Họ và tên" value={receiver.fullName} />
        <InfoRow icon={Tag} label="Vị trí" value={receiver.role} />
        <InfoRow icon={Hash} label="Email" value={receiver.email} />
        <InfoRow icon={Hash} label="Số điện thoại" value={receiver.phone} />
      </div>
    </div>

    {/* Payroll */}
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
          <Banknote size={15} className="text-emerald-600" />
        </div>
        <h4 className="font-bold text-gray-700 text-sm">Bảng lương tháng {payroll.month}</h4>
      </div>
      <div className="space-y-3">
        <InfoRow icon={Tag} label="Vị trí" value={payroll.roleName} />
        <InfoRow icon={Banknote} label="Lương cứng" value={formatCurrency(payroll.baseSalary)} />
        <InfoRow
          icon={ArrowUpRight}
          label="Phụ cấp / Thưởng"
          value={<span className="text-emerald-600">+{formatCurrency(payroll.allowance)}</span>}
        />
        <InfoRow
          icon={ArrowDownRight}
          label="Khấu trừ"
          value={<span className="text-rose-600">-{formatCurrency(payroll.deduction)}</span>}
        />
        <div className="border-t border-dashed border-gray-200 pt-3 mt-1">
          <InfoRow
            icon={CheckCircle2}
            label="Thực lãnh"
            value={<span className="text-emerald-700 text-base font-bold">{formatCurrency(payroll.totalSalary)}</span>}
          />
        </div>
      </div>
    </div>
  </div>
);

const CashbookDetail = () => {
  const { id } = useParams();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  const type = searchParams.get('type');
  const table = searchParams.get('table');

  const { data } = useFetch(cashbookService.getCashBookById, { id, type, table }, [id, type, table]);

  const isIN = data?.type === 'IN';
  const accentColor = isIN ? 'from-emerald-500 to-teal-600' : 'from-orange-500 to-amber-600';
  // const hasSalary = 'payroll' in data && data.payroll;
  // const hasStudent = 'student' in data && data.student;

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-8">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Quay lại Sổ Quỹ
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
        >
          <Printer size={16} />
          In Phiếu
        </button>
      </div>

      {/* ===== HERO CARD ===== */}
      {data ? (
        <div className={`bg-gradient-to-br ${accentColor} rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-lg`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <TypeBadge type={data.type} />
              <p className="font-mono text-xl font-bold mt-3 mb-1 tracking-wide">{data.code}</p>
              <p className="text-white/70 text-sm flex items-center gap-1.5">
                <Calendar size={14} />
                {formatDate(data.createdAt)} lúc {formatTime(data.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm mb-1">Số tiền</p>
              <p className="text-3xl sm:text-4xl font-black tracking-tight">
                {isIN ? '+' : '-'}
                {formatCurrency(data.amount)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* ===== THÔNG TIN CƠ BẢN ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Hình thức thanh toán */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <CreditCard size={15} className="text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-700 text-sm">Hình thức</h4>
          </div>
          <p className="text-xl font-bold text-gray-800">{PAYMENT_LABELS[data?.paymentMethod || ''] || '—'}</p>
        </div>

        {/* Danh mục (chỉ OUT OPERATION) */}
        {/* {'category' in data && data.category ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Tag size={15} className="text-orange-500" />
              </div>
              <h4 className="font-bold text-gray-700 text-sm">Danh mục</h4>
            </div>
            <p className="text-xl font-bold text-gray-800">{data.category}</p>
          </div>
        ) : null} */}

        {/* Người lập phiếu */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
              <Building2 size={15} className="text-violet-600" />
            </div>
            <h4 className="font-bold text-gray-700 text-sm">Người lập phiếu</h4>
          </div>
          <p className="text-base font-bold text-gray-800">
            {data?.processedBy?.fullName || data?.paidBy?.fullName || '—'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {data?.processedBy?.role || data?.paidBy?.role} · {data?.processedBy?.email || data?.paidBy?.email}
          </p>
        </div>
      </div>

      {/* ===== NỘI DUNG DIỄN GIẢI ===== */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText size={15} className="text-gray-500" />
          </div>
          <h4 className="font-bold text-gray-700 text-sm">Nội dung diễn giải</h4>
        </div>
        <p className="text-gray-700 leading-relaxed pl-11">
          {data?.description || data?.note || '(Không có nội dung)'}
        </p>
      </div>

      {/* ===== THÔNG TIN LIÊN QUAN ===== */}
      {table === 'transaction' && data?.studentId ? (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Thông tin học viên & Hóa đơn
          </h3>
          <StudentInvoiceCard student={data?.studentId} invoice={data?.invoiceId} />
        </div>
      ) : null}

      {data?.expenditureType === 'SALARY' && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Thông tin nhân viên & Bảng lương
          </h3>
          <ReceiverPayrollCard receiver={data?.receiverId} payroll={data?.payrollId} />
        </div>
      )}
    </div>
  );
};

export default CashbookDetail;
