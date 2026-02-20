import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model";
import { IUser } from "../types/user.type";
import { CreateUserSchema, UpdateUserSchema } from "../validations/users.schema";
import { ZodValidationError } from "../types/error.type";
import { formatZodError } from "../lib/formatZodError";
import { ObjectId } from 'mongodb'

export class UserService {
  // 1. Tạo mới User (Create)
  static async createUser(data: Partial<IUser>): Promise<IUser> {
    const validatedData = CreateUserSchema.safeParse(data);

    if (data.email) {
      const existingUser = await UserModel.findOne({ email: data.email });
      if (existingUser) throw new ZodValidationError({ email: "Email đã tồn tại" });
    }
    formatZodError(validatedData);
    const { email, password, fullName, phone } = validatedData.data!;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      fullName,
      phone,
    });

    return await newUser.save();
  }

  // 2. Lấy danh sách Users (Read All)
  static async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find().select("-password").sort({ createdAt: -1 });
  }

  // 3. Lấy chi tiết 1 User (Read One)
  static async getUserById(id: string): Promise<IUser | null> {
    if (!id.trim()) throw new Error("ID không được để trống")
    if (!ObjectId.isValid(id)) throw new Error("ID không hợp lệ")
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
    if (!id.trim()) throw new Error("ID không được để trống")
    if (!ObjectId.isValid(id)) throw new Error("ID không hợp lệ")
    return await UserModel.findByIdAndDelete(id);
  }
}
