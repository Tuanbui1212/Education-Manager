import { Request, Response } from "express";
import { RoomService } from "../services/room.service";

export class RoomController {
  // [POST] /api/rooms
  static async create(req: Request, res: Response) {
    try {
      const room = await RoomService.createRoom(req.body);
      res.status(201).json({ message: "Tạo phòng thành công", data: room });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  // [GET] /api/rooms
  static async getAll(req: Request, res: Response) {
    try {
      const rooms = await RoomService.getAllRooms();
      res.status(200).json({ data: rooms });
    } catch (error) {
      res.status(500).json({ message: "Lỗi Server" });
    }
  }

  // [GET] /api/rooms/:id
  static async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params as any;
      const room = await RoomService.getRoomById(id);
      if (!room)
        return res.status(404).json({ message: "Không tìm thấy phòng" });
      res.status(200).json({ data: room });
    } catch (error) {
      res.status(500).json({ message: "Lỗi Server" });
    }
  }

  // [PUT] /api/rooms/:id
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params as any;

      const room = await RoomService.updateRoom(id, req.body);
      if (!room)
        return res.status(404).json({ message: "Không tìm thấy phòng để sửa" });
      res.status(200).json({ message: "Cập nhật thành công", data: room });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  // [DELETE] /api/rooms/:id
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params as any;
      const room = await RoomService.deleteRoom(id);
      if (!room)
        return res.status(404).json({ message: "Không tìm thấy phòng để xóa" });
      res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi Server" });
    }
  }
}
