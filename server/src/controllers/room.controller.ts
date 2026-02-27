import { Request, Response } from "express";
import { RoomService } from "../services/room.service";
import {
  CreateRoomType,
  RoomIdType,
  UpdateRoomType,
} from "@/validations/room.validation";
import { GetRoomsQuery } from "@/types/room.type";

export class RoomController {
  private roomService = new RoomService();
  // [POST] /api/rooms
  create = async (req: Request<any, any, CreateRoomType>, res: Response) => {
    console.log(req.body);
    try {
      const room = await this.roomService.createRoom(req.body);
      res.status(201).json({ message: "Tạo phòng thành công", data: room });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };

  // [GET] /api/rooms
  getAll = async (req: Request<{}, {}, {}, GetRoomsQuery>, res: Response) => {
    try {
      const { rooms, total } = await this.roomService.getAllRooms(req.query);
      res.status(200).json({ data: rooms, total });
    } catch (error) {
      res.status(500).json({ message: "Lỗi Server" });
    }
  };

  // [GET] /api/rooms/:id
  getOne = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const room = await this.roomService.getRoomById(id as string);
      if (!room)
        return res.status(404).json({ message: "Không tìm thấy phòng" });
      res.status(200).json({ data: room });
    } catch (error) {
      res.status(500).json({ message: "Lỗi Server" });
    }
  };

  // [PUT] /api/rooms/:id
  update = async (
    req: Request<RoomIdType, any, UpdateRoomType>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;
      const room = await this.roomService.updateRoom(id, req.body);
      if (!room)
        return res.status(404).json({ message: "Không tìm thấy phòng để sửa" });
      res.status(200).json({ message: "Cập nhật thành công", data: room });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };

  // [DELETE] /api/rooms/:id
  delete = async (req: Request<RoomIdType>, res: Response) => {
    try {
      const { id } = req.params;
      const room = await this.roomService.deleteRoom(id);
      if (!room)
        return res.status(404).json({ message: "Không tìm thấy phòng để xóa" });
      res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi Server" });
    }
  };
}
