type StatusKey =
  // User / HR
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING'
  | 'SUSPENDED'
  // Student-specific
  | 'POTENTIAL'
  | 'RESERVED'
  // Class
  | 'UPCOMING'
  | 'COMPLETED'
  | 'MAINTENANCE'
  // Invoice
  | 'PAID'
  | 'UNPAID'
  | 'PARTIAL'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'CANCELLED'
  // Cashbook
  | 'IN'
  | 'OUT'
  // Contract
  | 'EXPIRED'
  | 'TERMINATED';

const STATUS_STYLES: Record<StatusKey, string> = {
  // User/HR
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  INACTIVE: 'bg-gray-100 text-gray-500 border-gray-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  SUSPENDED: 'bg-rose-50 text-rose-600 border-rose-100',
  // Student
  POTENTIAL: 'bg-amber-50 text-amber-700 border-amber-100',
  RESERVED: 'bg-sky-50 text-sky-700 border-sky-100',
  // Class
  UPCOMING: 'bg-sky-50 text-sky-700 border-sky-100',
  COMPLETED: 'bg-gray-100 text-gray-500 border-gray-200',
  MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-100',
  // Invoice
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  UNPAID: 'bg-blue-50 text-blue-700 border-blue-100',
  PARTIAL: 'bg-amber-50 text-amber-700 border-amber-100',
  OVERDUE: 'bg-rose-50 text-rose-600 border-rose-100',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-100',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  // Cashbook
  IN: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  OUT: 'bg-orange-50 text-orange-700 border-orange-100',
  // Contract
  EXPIRED: 'bg-red-50 text-red-600 border-red-100',
  TERMINATED: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_LABELS: Record<StatusKey, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  PENDING: 'Chờ duyệt',
  SUSPENDED: 'Tạm khóa',
  POTENTIAL: 'Tiềm năng',
  RESERVED: 'Bảo lưu',
  UPCOMING: 'Sắp khai giảng',
  COMPLETED: 'Đã kết thúc',
  MAINTENANCE: 'Bảo trì',
  PAID: 'Đã thanh toán',
  UNPAID: 'Chưa thanh toán',
  PARTIAL: 'Thanh toán một phần',
  OVERDUE: 'Quá hạn',
  REFUNDED: 'Đã hoàn tiền',
  CANCELLED: 'Đã hủy',
  IN: 'Thu',
  OUT: 'Chi',
  // Contract
  EXPIRED: 'Hết hạn',
  TERMINATED: 'Đã chấm dứt',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  pulse?: boolean;
}

const StatusBadge = ({ status, label, pulse = false }: StatusBadgeProps) => {
  const key = status as StatusKey;
  const styles = STATUS_STYLES[key] ?? 'bg-gray-100 text-gray-500 border-gray-200';
  const displayLabel = label ?? STATUS_LABELS[key] ?? status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${pulse ? 'animate-pulse' : ''}`}
    >
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
