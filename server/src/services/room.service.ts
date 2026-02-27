import { CreateRoomType, UpdateRoomType } from "@/validations/room.validation";
import { RoomModel } from "../models/room.model";
import { GetRoomsQuery, IRoom } from "../types/room.type";

export class RoomService {
  // 1. Tạo phòng mới
  async createRoom(data: CreateRoomType): Promise<IRoom> {
    const existingRoom = await RoomModel.findOne({ name: data.name });
    if (existingRoom) {
      throw new Error(`Phòng ${data.name} đã tồn tại!`);
    }

    const newRoom = new RoomModel(data);
    return await newRoom.save();
  }

  // 2. Lấy danh sách phòng
  async getAllRooms(query: GetRoomsQuery): Promise<{
    rooms: IRoom[];
    total: number;
  }> {
    const { page = 1, limit = 10, search = "", status } = query;
    const skip = (page - 1) * limit;

    const filter: any = {
      name: { $regex: search, $options: "i" },
    };
    if (status) {
      filter.status = status;
    }

    const [total, rooms] = await Promise.all([
      RoomModel.countDocuments(filter),
      RoomModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    ]);
    return { rooms, total };
  }

  // 3. Lấy chi tiết 1 phòng
  async getRoomById(id: string): Promise<IRoom | null> {
    return await RoomModel.findById(id);
  }

  // 4. Cập nhật phòng
  async updateRoom(id: string, data: UpdateRoomType): Promise<IRoom | null> {
    console.log(data);
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
  async deleteRoom(id: string): Promise<IRoom | null> {
    return await RoomModel.findByIdAndDelete(id);
  }
}
