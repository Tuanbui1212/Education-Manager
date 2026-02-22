import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model";
import { IUser, UserRole } from "../types/user.type";

export class UserService {
  // 1. Tạo mới User (Create)
  async createUser(data: Partial<IUser>): Promise<IUser> {
    if (data.email) {
      const existingUser = await UserModel.findOne({ email: data.email });
      if (existingUser) {
        throw new Error("Email đã tồn tại trong hệ thống!");
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
  async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find().select("-password").sort({ createdAt: -1 });
  }

  // 3. Lấy chi tiết 1 User (Read One)
  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).select("-password");
  }

  // 4. Cập nhật User (Update)
  async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    if (data.role) {
      const validRoles = Object.values(UserRole) as string[];
      if (!validRoles.includes(data.role)) {
        throw new Error(
          `Quyền hạn '${data.role}' không tồn tại. Đừng có hack nhé!`,
        );
      }
    }

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    return await UserModel.findByIdAndUpdate(id, data, { new: true }).select(
      "-password",
    );
  }

  // 5. Xóa User (Delete)
  async deleteUser(id: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id);
  }
}
