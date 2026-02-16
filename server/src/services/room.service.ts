import { RoomModel } from "../models/room.model";
import { IRoom } from "../types/room.type";

export class RoomService {
  // 1. Tạo phòng mới
  static async createRoom(data: Partial<IRoom>): Promise<IRoom> {
    const existingRoom = await RoomModel.findOne({ name: data.name });
    if (existingRoom) {
      throw new Error(`Phòng ${data.name} đã tồn tại!`);
    }

    const newRoom = new RoomModel(data);
    return await newRoom.save();
  }

  // 2. Lấy danh sách phòng
  static async getAllRooms(): Promise<IRoom[]> {
    return await RoomModel.find().sort({ name: 1 });
  }

  // 3. Lấy chi tiết 1 phòng
  static async getRoomById(id: string): Promise<IRoom | null> {
    return await RoomModel.findById(id);
  }

  // 4. Cập nhật phòng
  static async updateRoom(
    id: string,
    data: Partial<IRoom>,
  ): Promise<IRoom | null> {
    if (data.name) {
      const existingRoom = await RoomModel.findOne({
        name: data.name,
        _id: { $ne: id },
      });
      if (existingRoom) {
        throw new Error(
          `Tên phòng ${data.name} đã được sử dụng bởi phòng khác!`,
        );
      }
    }
    return await RoomModel.findByIdAndUpdate(id, data, { new: true });
  }

  // 5. Xóa phòng
  static async deleteRoom(id: string): Promise<IRoom | null> {
    return await RoomModel.findByIdAndDelete(id);
  }
}
