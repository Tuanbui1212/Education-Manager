import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';
import { IUser, UserRole, GetUsersQuery } from '../types/user.type';

export class UserService {
  // 1. Tạo mới User (Create)
  async createUser(data: Partial<IUser>): Promise<IUser> {
    if (data.email) {
      const existingUser = await UserModel.findOne({ email: data.email });
      if (existingUser) {
        throw new Error('Email đã tồn tại trong hệ thống!');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password as string, salt);

    const newUser = new UserModel({
      ...data,
      password: hashedPassword,
    });

    return await newUser.save();
  }

  // 2. Lấy danh sách Users (Read All)
  async getAllUsers(query: GetUsersQuery): Promise<{ users: IUser[]; totalCount: number }> {
    const { page = 1, limit = 10, search = '', role = '' } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      filter.role = role;
    }

    const [users, totalCount] = await Promise.all([
      UserModel.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(filter),
    ]);

    return { users, totalCount };
  }

  // 3. Lấy chi tiết 1 User (Read One)
  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).select('-password');
  }

  // 4. Cập nhật User (Update)
  async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    if (data.role) {
      const validRoles = Object.values(UserRole) as string[];
      if (!validRoles.includes(data.role)) {
        throw new Error(`Quyền hạn '${data.role}' không tồn tại. Đừng có hack nhé!`);
      }
    }

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    return await UserModel.findByIdAndUpdate(id, data, { new: true }).select('-password');
  }

  // 5. Xóa User (Delete)
  async deleteUser(id: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id);
  }
}
