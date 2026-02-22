import { ShiftModel } from '../models/shift.model';
import { IShift } from '../types/shift.type';

export class ShiftService {
  async createShift(data: Partial<IShift>) {
    const existingShift = await ShiftModel.findOne({ name: data.name });
    if (existingShift) {
      throw new Error(`Ca làm việc mang tên '${data.name}' đã tồn tại!`);
    }
    return await ShiftModel.create(data);
  }

  async getAllShifts() {
    return await ShiftModel.find().sort({ startTime: 1 });
  }

  async getShiftById(id: string) {
    return await ShiftModel.findById(id);
  }

  async updateShift(id: string, data: Partial<IShift>) {
    return await ShiftModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteShift(id: string) {
    return await ShiftModel.findByIdAndDelete(id);
  }
}
