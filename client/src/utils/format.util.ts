import type { RoomStatus } from '../types/room.type';
import type { NotificationType } from '../types/notificationTemplate.type';
import type { ScheduleStatus } from '../types/schedule.type';

export const getRoleStyles = (role: string): string => {
  const normalizedRole = role?.trim();

  switch (normalizedRole) {
    case 'Super Admin':
      return 'bg-rose-50 text-rose-600 border-rose-200 border';

    case 'Manager':
      return 'bg-indigo-50 text-indigo-600 border-indigo-200 border';

    case 'Teacher':
      return 'bg-sky-50 text-sky-600 border-sky-200 border';

    case 'Accountant':
      return 'bg-emerald-50 text-emerald-600 border-emerald-200 border';

    case 'Consultant':
      return 'bg-violet-50 text-violet-600 border-violet-200 border';

    case 'Student':
      return 'bg-teal-50 text-teal-600 border-teal-200 border';

    default:
      return 'bg-slate-50 text-slate-600 border-slate-200 border';
  }
};

export const getRoomStatusStyles = (status: RoomStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'MAINTENANCE':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'INACTIVE':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const getStatusUserStyles = (status: string): string => {
  switch (status) {
    case 'POTENTIAL':
      return 'px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200';
    case 'ACTIVE':
      return 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200';
    case 'RESERVED':
      return 'px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200';
    case 'INACTIVE':
      return 'px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200';
    default:
      return 'px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200';
  }
};

export const getNotificationTypeStyles = (type: NotificationType): string => {
  switch (type) {
    case 'EMAIL':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'SMS':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// Ham dinh dang ngay
export const formatDate = (dateString?: string | Date) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

// Hàm format tiền tệ VNĐ
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm format ngày tháng (DD/MM/YYYY)
export const formatDateA = (dateString: string | null) => {
  if (!dateString) return 'Hiện tại';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Hàm dịch chu kỳ sang Tiếng Việt
export const translateCycle = (cycle: string) => {
  switch (cycle) {
    case 'MONTHLY':
      return 'Hàng tháng';
    case 'QUARTERLY':
      return 'Hàng quý';
    case 'YEARLY':
      return 'Hàng năm';
    default:
      return cycle;
  }
};

export const translateRole = (roleName?: string): string => {
  if (!roleName) return 'Chưa phân quyền';

  const normalizedRole = roleName.toLowerCase().trim();

  const roleMap: Record<string, string> = {
    student: 'Học viên',
    teacher: 'Giáo viên',
    consultant: 'Tư vấn viên',
    sale: 'Nhân viên Sale',
    'super admin': 'Quản trị viên',
    manager: 'Quản lý',
    accountant: 'Kế toán',
    hr: 'Nhân sự',
    staff: 'Nhân viên',
  };

  return roleMap[normalizedRole] || roleName;
};

export const STATUS_CONFIG: Record<ScheduleStatus, { label: string; className: string; dot: string }> = {
  ongoing: { label: 'Đang học', className: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  upcoming: { label: 'Sắp tới', className: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  done: { label: 'Đã xong', className: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
};
