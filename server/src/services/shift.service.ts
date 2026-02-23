import { ShiftModel } from '../models/shift.model';
import { IShift } from '../types/shift.type';

export class ShiftService {
  // Tạo ca làm việc mới
  async createShift(data: Partial<IShift>) {
    const existingShift = await ShiftModel.findOne({ name: data.name });
    if (existingShift) {
      throw new Error(`Ca làm việc mang tên '${data.name}' đã tồn tại!`);
    }
    return await ShiftModel.create(data);
  }

  // Lấy danh sách ca làm việc
  async getAllShifts() {
    return await ShiftModel.find().sort({ startTime: 1 });
  }

  // Lấy chi tiết 1 ca làm việc
  async getShiftById(id: string) {
    return await ShiftModel.findById(id);
  }

  // Cập nhật ca làm việc
  async updateShift(id: string, data: Partial<IShift>) {
    return await ShiftModel.findByIdAndUpdate(id, data, { new: true });
  }

  // Xóa ca làm việc
  async deleteShift(id: string) {
    return await ShiftModel.findByIdAndDelete(id);
  }
}
