export const API_ROOT = 'http://localhost:5000/api';

export const PATHS = {
  HOME: '/',
  LOGIN: '/login',

  //Dashboard
  DASHBOARD: '/',

  //Dashboard/User
  USER: '/dashboard/users',
  USER_ID: '/dashboard/users/:id',

  TRANINING_STUDENT: '/training/students',

  //Settings

  SETTINGS_ROLES: '/accounts/roles',

  SETTINGS_SHIFTS: '/settings/shifts',

  SETTINGS_FIXED_COSTS: '/settings/fixed-costs',

  SETTINGS_EXPENDITURES: '/settings/expenditures',

  SETTINGS_ROOMS: '/settings/rooms',

  SETTINGS_NOTIFICATION_TEMPLATES: '/settings/notification-templates',

  //Training
  TRAINING_COURSES: '/training/courses',
  TRAINING_CLASSES: '/training/classes',
};

export const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'POTENTIAL', label: 'Tiềm năng' },
  { value: 'ACTIVE', label: 'Đang học' },
  { value: 'RESERVED', label: 'Bảo lưu' },
  { value: 'INACTIVE', label: 'Đã nghỉ' },
];
