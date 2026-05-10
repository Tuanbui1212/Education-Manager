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
  async getAllShifts(params?: { search?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 5, search = '' } = params || {};

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const data = await ShiftModel.find(query)
      .sort({ startTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await ShiftModel.countDocuments(query);

    return { data, totalCount };
  }

  // Lấy chi tiết 1 ca làm việc
  async getShiftById(id: string) {
    return await ShiftModel.findById(id);
  }

  // Cập nhật ca làm việc
  async updateShift(id: string, data: Partial<IShift>) {
    if (data.name) {
      const existingShift = await ShiftModel.findOne({ name: data.name, _id: { $ne: id } });
      if (existingShift) {
        throw new Error(`Ca làm việc mang tên '${data.name}' đã tồn tại!`);
      }
    }

    return await ShiftModel.findByIdAndUpdate(id, data, { new: true });
  }

  // Xóa ca làm việc
  async deleteShift(id: string) {
    return await ShiftModel.findByIdAndDelete(id);
  }
}
