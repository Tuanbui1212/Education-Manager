import type { UserRole } from '../types/user.type';

export const getRoleStyles = (role: UserRole): string => {
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

// Ham dinh dang ngay
export const formatDate = (dateString?: string | Date) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('vi-VN');
};
