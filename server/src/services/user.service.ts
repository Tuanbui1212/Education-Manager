// src/services/user.service.ts
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model";
import { IUser } from "../types/user.type";

export class UserService {
  // 1. Tạo mới User (Create)
  static async createUser(data: Partial<IUser>): Promise<IUser> {
    const { email, password } = data;

    // Logic: Check trùng email
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new Error("Email đã tồn tại trong hệ thống!");
    }

    // Logic: Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password!, salt);

    const newUser = new UserModel({
      ...data,
      password: hashedPassword,
    });

    return await newUser.save();
  }

  // 2. Lấy danh sách Users (Read All)
  static async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find().select("-password").sort({ createdAt: -1 });
  }

  // 3. Lấy chi tiết 1 User (Read One)
  static async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).select("-password");
  }

  // 4. Cập nhật User (Update)
  static async updateUser(
    id: string,
    data: Partial<IUser>,
  ): Promise<IUser | null> {
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    return await UserModel.findByIdAndUpdate(id, data, { new: true }).select(
      "-password",
    );
  }

  // 5. Xóa User (Delete)
  static async deleteUser(id: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id);
  }
}
