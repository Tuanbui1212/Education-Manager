import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';
import { IUser } from '../types/user.type';

export class AuthService {
  // 1. Đăng nhập (Login)
  async login(email: string, password: string) {
    console.log(email, password);

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      throw new Error('Email không tồn tại trong hệ thống!');
    }
    const isPasswordValid = await bcrypt.compare(password, existingUser.password as string);
    if (!isPasswordValid) {
      throw new Error('Mật khẩu không đúng!');
    }

    const payload = {
      id: existingUser._id.toString(),
      email: existingUser.email,
      role: existingUser.role,
      name: existingUser.fullName,
      phone: existingUser.phone,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
      expiresIn: process.env.JWT_EXPIRES_IN as any,
    });
    return accessToken;
  }
}
