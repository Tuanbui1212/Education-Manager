export const PERMISSIONS = {
  // Người dùng & Phân quyền
  USER: { VIEW: 'user.view', CREATE: 'user.create', EDIT: 'user.edit', DELETE: 'user.delete' },
  ROLE: { VIEW: 'role.view', CREATE: 'role.create', EDIT: 'role.edit', DELETE: 'role.delete' },

  // Đào tạo
  COURSE: { VIEW: 'course.view', CREATE: 'course.create', EDIT: 'course.edit', DELETE: 'course.delete' },
  CLASS: { VIEW: 'class.view', CREATE: 'class.create', EDIT: 'class.edit', DELETE: 'class.delete' },

  // Cơ sở vật chất & Lịch
  ROOM: { VIEW: 'room.view', CREATE: 'room.create', EDIT: 'room.edit', DELETE: 'room.delete' },
  SHIFT: { VIEW: 'shift.view', CREATE: 'shift.create', EDIT: 'shift.edit', DELETE: 'shift.delete' },

  // Tài chính
  EXPENDITURE: {
    VIEW: 'expenditure.view',
    CREATE: 'expenditure.create',
    EDIT: 'expenditure.edit',
    DELETE: 'expenditure.delete',
  },
  FIXED_COST: {
    VIEW: 'fixed_cost.view',
    CREATE: 'fixed_cost.create',
    EDIT: 'fixed_cost.edit',
    DELETE: 'fixed_cost.delete',
  },
  // Hệ thống
  NOTIFICATION_TEMPLATE: {
    VIEW: 'notification_template.view',
    CREATE: 'notification_template.create',
    EDIT: 'notification_template.edit',
    DELETE: 'notification_template.delete',
  },

  // (Dự phòng cho tương lai)
  ATTENDANCE: { VIEW: 'attendance.view', EDIT: 'attendance.edit' },
  SCORE: { VIEW: 'score.view', EDIT: 'score.edit' },
  INVOICE: { VIEW: 'invoice.view', CREATE: 'invoice.create', EDIT: 'invoice.edit' },
  SALARY: { VIEW: 'salary.view', CALCULATE: 'salary.calculate' },
  CRM: { VIEW: 'crm.view', CREATE: 'crm.create', EDIT: 'crm.edit' },
};

export const PERMISSION_LIST_UI = [
  {
    module: 'Quản lý Người dùng & Phân quyền',
    permissions: [
      { code: PERMISSIONS.USER.VIEW, name: 'Xem danh sách người dùng' },
      { code: PERMISSIONS.USER.CREATE, name: 'Tạo người dùng mới' },
      { code: PERMISSIONS.USER.EDIT, name: 'Cập nhật thông tin người dùng' },
      { code: PERMISSIONS.USER.DELETE, name: 'Xóa người dùng' },
      { code: PERMISSIONS.ROLE.VIEW, name: 'Xem danh sách vai trò' },
      { code: PERMISSIONS.ROLE.CREATE, name: 'Tạo vai trò mới' },
      { code: PERMISSIONS.ROLE.EDIT, name: 'Chỉnh sửa vai trò' },
      { code: PERMISSIONS.ROLE.DELETE, name: 'Xóa vai trò' },
    ],
  },
  {
    module: 'Quản lý Đào tạo (Khóa học & Lớp học)',
    permissions: [
      { code: PERMISSIONS.COURSE.VIEW, name: 'Xem danh sách Khóa học' },
      { code: PERMISSIONS.COURSE.CREATE, name: 'Tạo Khóa học mới' },
      { code: PERMISSIONS.COURSE.EDIT, name: 'Chỉnh sửa Khóa học' },
      { code: PERMISSIONS.COURSE.DELETE, name: 'Xóa Khóa học' },
      { code: PERMISSIONS.CLASS.VIEW, name: 'Xem danh sách Lớp học' },
      { code: PERMISSIONS.CLASS.CREATE, name: 'Tạo Lớp học mới' },
      { code: PERMISSIONS.CLASS.EDIT, name: 'Chỉnh sửa Lớp học' },
      { code: PERMISSIONS.CLASS.DELETE, name: 'Xóa Lớp học' },
      { code: PERMISSIONS.ATTENDANCE.VIEW, name: 'Xem Điểm danh' },
      { code: PERMISSIONS.ATTENDANCE.EDIT, name: 'Chấm Điểm danh' },
      { code: PERMISSIONS.SCORE.VIEW, name: 'Xem Bảng điểm' },
      { code: PERMISSIONS.SCORE.EDIT, name: 'Nhập/Sửa Bảng điểm' },
    ],
  },
  {
    module: 'Quản lý Cơ sở vật chất & Ca học',
    permissions: [
      { code: PERMISSIONS.ROOM.VIEW, name: 'Xem danh sách Phòng học' },
      { code: PERMISSIONS.ROOM.CREATE, name: 'Thêm Phòng học mới' },
      { code: PERMISSIONS.ROOM.EDIT, name: 'Sửa thông tin Phòng học' },
      { code: PERMISSIONS.ROOM.DELETE, name: 'Xóa Phòng học' },
      { code: PERMISSIONS.SHIFT.VIEW, name: 'Xem danh sách Ca học' },
      { code: PERMISSIONS.SHIFT.CREATE, name: 'Thêm Ca học mới' },
      { code: PERMISSIONS.SHIFT.EDIT, name: 'Sửa thông tin Ca học' },
      { code: PERMISSIONS.SHIFT.DELETE, name: 'Xóa Ca học' },
    ],
  },
  {
    module: 'Quản lý Tài chính & Kế toán',
    permissions: [
      { code: PERMISSIONS.INVOICE.VIEW, name: 'Xem danh sách Hóa đơn/Học phí' },
      { code: PERMISSIONS.INVOICE.CREATE, name: 'Tạo Hóa đơn thu học phí' },
      { code: PERMISSIONS.INVOICE.EDIT, name: 'Chỉnh sửa Hóa đơn' },
      { code: PERMISSIONS.EXPENDITURE.VIEW, name: 'Xem Phiếu chi / Nhật ký chi tiêu' },
      { code: PERMISSIONS.EXPENDITURE.CREATE, name: 'Tạo Phiếu chi mới' },
      { code: PERMISSIONS.EXPENDITURE.EDIT, name: 'Sửa Phiếu chi' },
      { code: PERMISSIONS.FIXED_COST.VIEW, name: 'Xem cấu hình Chi phí cố định' },
      { code: PERMISSIONS.FIXED_COST.CREATE, name: 'Thêm Chi phí cố định' },
      { code: PERMISSIONS.FIXED_COST.EDIT, name: 'Sửa Chi phí cố định' },
      { code: PERMISSIONS.SALARY.VIEW, name: 'Xem Bảng lương' },
      { code: PERMISSIONS.SALARY.CALCULATE, name: 'Tính lương nhân viên' },
    ],
  },
  {
    module: 'Quản lý Tuyển sinh (CRM)',
    permissions: [
      { code: PERMISSIONS.CRM.VIEW, name: 'Xem Lịch sử tư vấn' },
      { code: PERMISSIONS.CRM.CREATE, name: 'Tạo Lịch sử tư vấn mới' },
      { code: PERMISSIONS.CRM.EDIT, name: 'Sửa thông tin tư vấn' },
    ],
  },
  {
    module: 'Hệ thống & Thông báo',
    permissions: [
      { code: PERMISSIONS.NOTIFICATION_TEMPLATE.VIEW, name: 'Xem mẫu thông báo' },
      { code: PERMISSIONS.NOTIFICATION_TEMPLATE.CREATE, name: 'Tạo mẫu thông báo' },
      { code: PERMISSIONS.NOTIFICATION_TEMPLATE.EDIT, name: 'Sửa mẫu thông báo' },
      { code: PERMISSIONS.NOTIFICATION_TEMPLATE.DELETE, name: 'Xóa mẫu thông báo' },
    ],
  },
];
