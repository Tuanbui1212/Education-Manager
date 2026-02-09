import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  // [POST] /api/users
  static async create(req: Request, res: Response) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({ message: "Tạo user thành công", data: user });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  // [GET] /api/users
  static async getAll(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json({ data: users });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  }

  // [GET] /api/users/:id
  static async getOne(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      console.log("ID received:", id);

      const user = await UserService.getUserById(id);
      if (!user)
        return res.status(404).json({ message: "Không tìm thấy user" });
      res.status(200).json({ data: user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Lỗi server" });
    }
  }

  //[PUT] /api/users/:id
  static async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const user = await UserService.updateUser(id, req.body);
      if (!user)
        return res.status(404).json({ message: "Không tìm thấy user để sửa" });
      res.status(200).json({ message: "Cập nhật thành công", data: user });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  }

  // [DELETE] /api/users/:id
  static async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const user = await UserService.deleteUser(id);
      if (!user)
        return res.status(404).json({ message: "Không tìm thấy user để xóa" });
      res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  }
}
