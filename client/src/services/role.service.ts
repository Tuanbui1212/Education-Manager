import axios from './axiosClient';
import type { IRole, RoleResponse, SingleRoleResponse, GetRolesParams } from '../types/role.type';

export const roleService = {
  // Lấy danh sách Vai trò (Dùng để đổ vào Select box trong Form User hoặc trang quản lý Role)
  getRoles: async (params?: GetRolesParams): Promise<RoleResponse> => {
    const response = await axios.get('/roles', { params });
    return response.data;
  },

  // Lấy chi tiết 1 Role
  getRoleById: async (id: string): Promise<SingleRoleResponse> => {
    const response = await axios.get(`/roles/${id}`);
    return response.data;
  },

  // Tạo Role mới
  createRole: async (roleData: Partial<IRole>): Promise<SingleRoleResponse> => {
    const response = await axios.post('/roles', roleData);
    return response.data;
  },

  // Cập nhật Role (Sửa tên hoặc sửa mảng permissions)
  updateRole: async (id: string, roleData: Partial<IRole>): Promise<SingleRoleResponse> => {
    const response = await axios.put(`/roles/${id}`, roleData as any);
    return response.data;
  },

  // Xóa Role
  deleteRole: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/roles/${id}`);
    return response.data;
  },
};
