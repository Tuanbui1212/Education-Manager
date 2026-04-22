import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserModel } from '../models/user.model';
import { EmailService } from './email.service';

export class AuthService {
  private emailService = new EmailService();

  // 1. Đăng nhập (Login)
  async login(email: string, password: string) {
    const existingUser = await UserModel.findOne({ email }).populate('roleId');

    if (!existingUser) {
      throw new Error('Email không tồn tại trong hệ thống!');
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password as string);
    if (!isPasswordValid) {
      throw new Error('Mật khẩu không đúng!');
    }

    const userRole = existingUser.roleId as any;

    const payload = {
      id: existingUser._id.toString(),
      success: true,
      email: existingUser.email,
      role: userRole,
      name: existingUser.fullName,
      phone: existingUser.phone,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
      expiresIn: process.env.JWT_EXPIRES_IN as any,
    });

    return accessToken;
  }

  // 2. Quên mật khẩu: Tạo token và gửi email
  async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Email không tồn tại trong hệ thống');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires as any;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    const emailPayload = {
      fullName: user.fullName,
      resetUrl: resetUrl,
    };

    const isSent = await this.emailService.sendEmailWithTemplate(user.email, 'FORGOT_PASSWORD', emailPayload);

    if (!isSent) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw new Error('Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.');
    }

    return { message: 'Đã gửi liên kết đặt lại mật khẩu vào email của bạn.' };
  }

  // 3. Đặt lại mật khẩu: Xác thực token và lưu mật khẩu mới
  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return { message: 'Đặt lại mật khẩu thành công' };
  }
}
