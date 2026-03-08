import type { RoomStatus } from '../types/room.type';
import type { NotificationType } from '../types/notificationTemplate.type';

export const getRoleStyles = (role: string): string => {
  switch (role) {
    case 'ADMIN':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'TEACHER':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'STUDENT':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'SALE':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'TEACHING_ASSISTANT':
      return 'bg-pink-100 text-pink-700 border-pink-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
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
