import { ClassStatus } from '../types/class.type';
import type { PaymentMethod } from '../types/transaction.type';

export const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const PATHS = {
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  PROFILE_STUDENT: '/profile/student',
  PROFILE_STAFF: '/profile',
  PROFILE_TEACHER: '/profile/teacher',

  //Dashboard
  DASHBOARD: '/',

  //Dashboard/User
  USER: '/accounts/list',
  USER_ID: '/dashboard/users/:id',

  //Account Management
  ACCOUNT_USERS_CREATE: '/accounts/users/create',
  ACCOUNT_USERS_EDIT: '/accounts/users/edit/:id',

  ACCOUNT_ROLES_CREATE: '/accounts/roles/create',
  ACCOUNT_ROLES_EDIT: '/accounts/roles/edit/:id',

  ACCOUNT_LOGS: '/accounts/logs',

  SETTINGS_ROLES: '/accounts/roles',
  ACCOUNT_ROLE_ID: '/accounts/roles/:id',

  //HR
  HR_TEACHERS: '/hr/teachers',
  HR_TEACHERS_ID: '/hr/teachers/:id',
  HR_TEACHERS_CREATE: '/hr/teachers/create',
  HR_TEACHERS_EDIT: '/hr/teachers/edit/:id',

  HR_STAFFS: '/hr/staffs',
  HR_STAFFS_ID: '/hr/staffs/:id',
  HR_STAFFS_CREATE: '/hr/staffs/create',
  HR_STAFFS_EDIT: '/hr/staffs/edit/:id',

  HR_CONTRACTS: '/hr/contracts',

  HR_PAYROLL: '/hr/payroll',
  HR_PAYROLL_ID: '/hr/payroll/:id',

  //Settings
  SETTINGS_SHIFTS: '/settings/shifts',
  SETTINGS_FIXED_COSTS: '/settings/fixed-costs',

  SETTINGS_ROOMS: '/settings/rooms',
  SETTINGS_ROOMS_ID: '/settings/rooms/:id',
  SETTINGS_NOTIFICATION_TEMPLATES: '/settings/notification-templates',

  //Training
  TRAINING_STUDENT: '/training/students',
  TRAINING_STUDENT_ID: '/training/students/:id',
  TRAINING_STUDENT_CREATE: '/training/students/create',
  TRAINING_STUDENT_EDIT: '/training/students/edit/:id',

  TRAINING_COURSES: '/training/courses',
  TRAINING_COURSES_ID: '/training/courses/:id',

  TRAINING_CLASSES: '/training/classes',
  TRAINING_CLASSES_ID: '/training/classes/:id',
  TRAINING_CLASSES_CREATE: '/training/classes/create',
  TRAINING_CLASSES_CREATE_SCHEDULE: '/training/classes/create-schedule/:id',
  TRAINING_SCHEDULES: '/training/schedules',
  TRAINING_AUTO_SCHEDULES: '/training/auto-schedules',

  //Finace
  FINANCE_INVOICES: '/finance/invoices',
  FINANCE_INVOICES_ID: '/finance/invoices/:id',

  FINANCE_TRANSACTIONS: '/finance/cashbooks',
  FINANCE_TRANSACTIONS_ID: '/finance/transactions/:id',

  FINANCE_EXPENDITURES: '/finance/expenditures',
  FINANCE_EXPENDITURES_ID: '/finance/expenditures/:id',

  FINANCE_REPORT: '/finance/reports',

  //Portal
  STUDENT_PORTAL: '/student-portal',
  STUDENT_ATTENDANCE: '/student-attendance/:id',

  TEACHER_PORTAL: '/teacher-portal',
  TEACHER_ATTENDANCE_SCHEDULES: '/teacher-attendance/:classId',
  TEACHER_ATTENDANCE_DETAILS: '/teacher-attendance/:classId/schedule/:scheduleId',
  TEACHER_EXAM_MANAGER: '/teacher-exam/:classId',

  STUDENT_EXAM_TAKING: '/student-exam/:examId',
};

export const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'POTENTIAL', label: 'Tiềm năng' },
  { value: 'ACTIVE', label: 'Đang học' },
  { value: 'RESERVED', label: 'Bảo lưu' },
  { value: 'INACTIVE', label: 'Đã nghỉ' },
];

export const STATUS_USER_OPTIONS = [
  { value: 'ACTIVE', label: 'Hoạt Động' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
];

export const TEACHER_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang giảng dạy' },
  { value: 'INACTIVE', label: 'Đã nghỉ' },
];

export const DAYS_OF_WEEK = [
  { label: 'T2', value: 1 },
  { label: 'T3', value: 2 },
  { label: 'T4', value: 3 },
  { label: 'T5', value: 4 },
  { label: 'T6', value: 5 },
  { label: 'T7', value: 6 },
  { label: 'CN', value: 0 },
];

export const NAME_ROLES = [
  { label: 'Học viên', value: 'STUDENT' },
  { label: 'Giáo viên', value: 'TEACHER' },
  { label: 'Tư vấn viên', value: 'CONSULTANT' },
  { label: 'Nhân viên Sale', value: 'SALE' },
  { label: 'Quản trị viên', value: 'SUPER ADMIN' },
  { label: 'Quản lý', value: 'MANAGER' },
  { label: 'Kế toán', value: 'ACCOUNTANT' },
  { label: 'Nhân sự', value: 'HR' },
  { label: 'Nhân viên', value: 'STAFF' },
];

export const CLASS_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  [ClassStatus.ACTIVE]: { label: 'Đang học', bg: 'bg-blue-100', text: 'text-blue-700' },
  [ClassStatus.COMPLETED]: { label: 'Đã kết thúc', bg: 'bg-gray-100', text: 'text-gray-600' },
  [ClassStatus.UPCOMING]: { label: 'Sắp diễn ra', bg: 'bg-green-100', text: 'text-green-700' },
};

export const PAYMENT_CONFIG: Record<string, { label: string; className: string }> = {
  CASH: {
    label: 'Tiền mặt',
    className: 'bg-green-100 text-green-700',
  },
  TRANSFER: {
    label: 'Chuyển khoản',
    className: 'bg-blue-100 text-blue-700',
  },
  CARD: {
    label: 'Quẹt thẻ',
    className: 'bg-purple-100 text-purple-700',
  },
  VNPAY: {
    label: 'VNPay',
    className: 'bg-yellow-100 text-yellow-700',
  },
};

export const SYSTEM_TEMPLATE_CODES: { value: string; label: string }[] = [
  { value: 'REMIND_DEBT', label: 'Gửi thông báo nhắc nợ học phí' },
  { value: 'ENROLL_SUCCESS', label: 'Chào mừng ghi danh thành công' },
  { value: 'PAYMENT_SUCCESS', label: 'Xác nhận đã thanh toán' },
  { value: 'CLASS_OPENING', label: 'Thông báo khai giảng lớp mới' },
  { value: 'INSTALLMENT_CREATED', label: 'Thông báo tạo lịch trả góp' },
  { value: 'REMIND_INSTALLMENT', label: 'Thông báo lịch trả góp' },
  { value: 'FORGOT_PASSWORD', label: 'Xác nhận quên mật khẩu' },
  { value: 'MONTHLY_PAYROLL_NOTICE', label: 'Thông báo bảng lương hàng tháng' },
];

export const CLASS_COLORS = [
  { bg: '#EEF0FE', tc: '#3730A3', dot: '#4F46E5' },
  { bg: '#FEF3C7', tc: '#92400E', dot: '#D97706' },
  { bg: '#DCFCE7', tc: '#14532D', dot: '#16A34A' },
  { bg: '#FEE2E2', tc: '#991B1B', dot: '#DC2626' },
  { bg: '#F3E8FF', tc: '#6B21A8', dot: '#9333EA' },
  { bg: '#FFEDD5', tc: '#9A3412', dot: '#EA580C' },
];

export const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export const DAYS_FULL = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
export const SLOTS = ['7h30', '9h00', '10h30', '13h30', '15h00'];
export const MORNING_SLOTS = new Set();

export const SESSIONS = [
  { value: 'morning', label: 'Ca sáng' },
  { value: 'afternoon', label: 'Ca chiều' },
  { value: 'evening', label: 'Ca tối' },
];

export const SCHEDULE_OPTS = [
  { key: 'preferEarlyWeek', label: 'Ưu tiên đầu tuần' },
  { key: 'noSameDay', label: 'Không dạy 2 buổi cùng ngày' },
  { key: 'noConsec', label: 'Không dạy ngày liền – dãn đều' },
];

export const PRIMARY = '#3C3489';
export const GREEN = '#1D7A4A';
