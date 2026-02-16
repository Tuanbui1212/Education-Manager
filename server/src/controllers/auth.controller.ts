import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  private authService = new AuthService();

  // [POST] /api/login
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };
      const user = await this.authService.login(email, password);
      res.status(200).json({ message: "Đăng nhập thành công", data: user });
    } catch (error) {
      res
        .status(400)
        .json({ message: (error as Error).message, data: "Khong co" });
    }
  };
}
