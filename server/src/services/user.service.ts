import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';
import RoleModel from '../models/role.model';
import { ClassModel } from '../models/class.model';
import { IUser, GetUsersQuery, UserStatus } from '../types/user.type';

export class UserService {
  // 1. Tạo mới User (Create)
  async createUser(data: Partial<IUser>): Promise<IUser> {
    if (data.email) {
      const existingUser = await UserModel.findOne({ email: data.email });
      if (existingUser) {
        throw new Error('Email đã tồn tại trong hệ thống!');
      }
    }

    if (data.roleId) {
      const roleExists = await RoleModel.findById(data.roleId);
      if (!roleExists) throw new Error('Vai trò (Role) này không tồn tại trong hệ thống!');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password as string, salt);

    const newUser = new UserModel({
      ...data,
      password: hashedPassword,
    });

    await newUser.save();

    return newUser.populate('roleId', 'name permissions');
  }

  // 2. Lấy danh sách Users (Read All)
  async getAllUsers(query: GetUsersQuery): Promise<{ users: IUser[]; totalCount: number }> {
    const { page = 1, limit = 10, search = '', roleId = '', status = '' } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (roleId) {
      filter.roleId = roleId;
    }

    if (status) {
      filter.status = status;
    }

    const [users, totalCount] = await Promise.all([
      UserModel.find(filter)
        .select('-password')
        .populate('roleId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(filter),
    ]);

    return { users, totalCount };
  }

  // 3. Lấy chi tiết 1 User
  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).select('-password').populate('roleId', 'name permissions');
  }

  // 4. Cập nhật User
  async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    if (data.roleId) {
      const roleExists = await RoleModel.findById(data.roleId);
      if (!roleExists) {
        throw new Error(`Vai trò không tồn tại. Đừng có hack nhé!`);
      }
    }

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    return await UserModel.findByIdAndUpdate(id, data, { new: true }).select('-password').populate('roleId', 'name'); // Populate để trả về data mới nhất cho Frontend
  }

  // 5. Xóa User
  async deleteUser(id: string): Promise<{ action: 'SOFT_DELETE' | 'HARD_DELETE'; user: IUser }> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('Người dùng không tồn tại!');
    }

    const isLinkedToClass = await ClassModel.findOne({
      $or: [{ teacherId: id }, { studentIds: id }],
    });

    // Nếu bạn muốn check thêm bảng Lịch học (Schedules) hay Giao dịch (Invoices), bạn có thể query tương tự ở đây
    // const isLinkedToSchedule = await ScheduleModel.findOne({ teacherId: id });

    if (isLinkedToClass) {
      user.status = UserStatus.INACTIVE;
      await user.save();

      return {
        action: 'SOFT_DELETE',
        user: user,
      };
    } else {
      const deletedUser = await UserModel.findByIdAndDelete(id);

      return {
        action: 'HARD_DELETE',
        user: deletedUser as IUser,
      };
    }
  }
}
