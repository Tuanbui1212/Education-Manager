import RoleModel from '../models/role.model';
import { UserModel } from '../models/user.model';
import { IRole, GetRolesQuery } from '../types/role.type';

export class RoleService {
  // 1. Tạo Role mới
  async createRole(data: Partial<IRole>) {
    return await RoleModel.create(data);
  }

  // 2. Lấy danh sách
  async getAllRoles(query: GetRolesQuery): Promise<{ items: IRole[]; total: number }> {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const items = await RoleModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await RoleModel.countDocuments();
    return { items, total };
  }

  // 3. Lấy chi tiết 1 Role
  async getRoleById(id: string) {
    return await RoleModel.findById(id);
  }

  // 4. Cập nhật Role
  async updateRole(id: string, data: Partial<IRole>) {
    return await RoleModel.findByIdAndUpdate(id, data, { new: true });
  }

  // 5. Xóa Role
  async deleteRole(id: string) {
    const usersWithThisRole = await UserModel.countDocuments({ roleId: id });

    if (usersWithThisRole > 0) {
      throw new Error(
        `Không thể xóa! Đang có ${usersWithThisRole} người dùng thuộc vai trò này. Vui lòng chuyển vai trò của họ trước khi xóa.`,
      );
    }

    return await RoleModel.findByIdAndDelete(id);
  }
}
