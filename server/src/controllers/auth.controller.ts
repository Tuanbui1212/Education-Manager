import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService = new AuthService();

  // [POST] /api/auth/login
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };
      const user = await this.authService.login(email, password);
      res.status(200).json({ message: 'Đăng nhập thành công', data: user });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message, data: 'Không đăng nhập được' });
    }
  };

  // [POST] /api/auth/forgot-password
  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email' });
      }

      const result = await this.authService.forgotPassword(email);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  // [POST] /api/auth/reset-password
  resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu token xác thực hoặc mật khẩu mới',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải có ít nhất 6 ký tự',
        });
      }

      const result = await this.authService.resetPassword(token, newPassword);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
}
