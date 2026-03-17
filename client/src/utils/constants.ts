export const API_ROOT = 'http://localhost:5000/api';

export const PATHS = {
  HOME: '/',
  LOGIN: '/login',

  //Dashboard
  DASHBOARD: '/',

  //Dashboard/User
  USER: '/dashboard/users',
  USER_ID: '/dashboard/users/:id',

  //HR
  HR_TEACHERS: '/hr/teachers',
  HR_TEACHERS_ID: '/hr/teachers/:id',

  HR_TUTORS: '/hr/tutors',

  HR_STAFFS: '/hr/staffs',
  HR_STAFFS_ID: '/hr/staffs/:id',

  HR_CONTRACTS: '/hr/contracts',

  //Settings
  SETTINGS_ROLES: '/accounts/roles',
  SETTINGS_SHIFTS: '/settings/shifts',
  SETTINGS_FIXED_COSTS: '/settings/fixed-costs',
  SETTINGS_EXPENDITURES: '/settings/expenditures',
  SETTINGS_ROOMS: '/settings/rooms',
  SETTINGS_ROOMS_ID: '/settings/rooms/:id',
  SETTINGS_NOTIFICATION_TEMPLATES: '/settings/notification-templates',

  //Training
  TRANINING_STUDENT: '/training/students',
  TRANINING_STUDENT_ID: '/training/students/:id',
  TRAINING_COURSES: '/training/courses',
  TRAINING_CLASSES: '/training/classes',
  TRAINING_CLASSES_ID: '/training/classes/:id',
  TRAINING_SCHEDULES: '/training/schedules',
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
