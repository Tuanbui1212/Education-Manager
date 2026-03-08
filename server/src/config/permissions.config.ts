export const PERMISSIONS = {
  USER: {
    VIEW: 'user.view',
    CREATE: 'user.create',
    EDIT: 'user.edit',
    DELETE: 'user.delete',
  },
  ROLE: {
    VIEW: 'role.view',
    CREATE: 'role.create',
    EDIT: 'role.edit',
    DELETE: 'role.delete',
  },
  ROOM: {
    VIEW: 'room.view',
    CREATE: 'room.create',
    EDIT: 'room.edit',
    DELETE: 'room.delete',
  },
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
  NOTIFICATION_TEMPLATE: {
    VIEW: 'notification_template.view',
    CREATE: 'notification_template.create',
    EDIT: 'notification_template.edit',
    DELETE: 'notification_template.delete',
  },
};

export const PERMISSION_LIST_UI = [
  {
    module: 'Quản lý Người dùng & Vai trò',
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
    module: 'Quản lý Đào tạo & Cơ sở vật chất',
    permissions: [
      { code: PERMISSIONS.ROOM.VIEW, name: 'Xem danh sách phòng học' },
      { code: PERMISSIONS.ROOM.CREATE, name: 'Thêm phòng học mới' },
      { code: PERMISSIONS.ROOM.EDIT, name: 'Sửa thông tin phòng học' },
      { code: PERMISSIONS.ROOM.DELETE, name: 'Xóa phòng học' },
    ],
  },
  {
    module: 'Quản lý Tài chính (Thu/Chi)',
    permissions: [
      { code: PERMISSIONS.EXPENDITURE.VIEW, name: 'Xem sổ quỹ / Nhật ký chi tiêu' },
      { code: PERMISSIONS.EXPENDITURE.CREATE, name: 'Tạo phiếu chi mới' },
      { code: PERMISSIONS.EXPENDITURE.EDIT, name: 'Sửa phiếu chi' },
      { code: PERMISSIONS.EXPENDITURE.DELETE, name: 'Xóa phiếu chi' },

      { code: PERMISSIONS.FIXED_COST.VIEW, name: 'Xem danh sách chi phí cố định' },
      { code: PERMISSIONS.FIXED_COST.CREATE, name: 'Thêm cấu hình chi phí mới' },
      { code: PERMISSIONS.FIXED_COST.EDIT, name: 'Sửa cấu hình chi phí' },
      { code: PERMISSIONS.FIXED_COST.DELETE, name: 'Xóa cấu hình chi phí' },
    ],
  },
  {
    module: 'Quản lý Hệ thống & Thông báo',
    permissions: [
      { code: PERMISSIONS.NOTIFICATION_TEMPLATE.VIEW, name: 'Xem mẫu thông báo' },
      { code: PERMISSIONS.NOTIFICATION_TEMPLATE.CREATE, name: 'Tạo mẫu thông báo' },
      { code: PERMISSIONS.NOTIFICATION_TEMPLATE.EDIT, name: 'Sửa mẫu thông báo' },
      { code: PERMISSIONS.NOTIFICATION_TEMPLATE.DELETE, name: 'Xóa mẫu thông báo' },
    ],
  },
];
