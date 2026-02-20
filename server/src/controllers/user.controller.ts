import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ZodValidationError } from "../types/error.type";
export class UserController {
  // [POST] /api/users
  static async create(req: Request, res: Response) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({ success: true, message: "Tạo user thành công", data: user });
    } catch (error) {
      if (error instanceof ZodValidationError) {
        return res.status(400).json({ success: false, message: error.errors });
      }
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }

  // [GET] /api/users
  static async getAll(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }

  // [GET] /api/users/:id
  static async getOne(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await UserService.getUserById(id);
      if (!user)
        return res.status(404).json({ success: false, message: "Không tìm thấy user" });
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ success: false, message: error?.message || "Lỗi server" });
    }
  }

  //[PUT] /api/users/:id
  static async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const user = await UserService.updateUser(id, req.body);
      if (!user)
        return res.status(404).json({ success: false, message: "Không tìm thấy user để sửa" });
      res.status(200).json({ success: true, message: "Cập nhật thành công", data: user });
    } catch (error) {
      if (error instanceof ZodValidationError) {
        return res.status(400).json({ success: false, message: error.errors });
      }
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }

  // [DELETE] /api/users/:id
  static async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const user = await UserService.deleteUser(id);
      if (!user)
        return res.status(404).json({ success: false, message: "Không tìm thấy user để xóa" });
      res.status(200).json({ success: true, message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }
}
