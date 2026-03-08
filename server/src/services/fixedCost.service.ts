import FixedCostModel from '../models/fixedCost.model';
import { IFixedCost } from '../types/fixedCost.type';

export class FixedCostService {
  // 1. Tạo mới
  async createFixedCost(data: Partial<IFixedCost>) {
    return await FixedCostModel.create(data);
  }

  // 2. Lấy danh sách (có phân trang nhẹ)
  async getAllFixedCosts(limit: number = 10, page: number = 1) {
    const skip = (page - 1) * limit;
    const items = await FixedCostModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await FixedCostModel.countDocuments();
    return { items, total };
  }

  // 3. Lấy chi tiết theo ID
  async getFixedCostById(id: string) {
    return await FixedCostModel.findById(id);
  }

  // 4. Cập nhật (Cơ bản)
  async updateFixedCost(id: string, data: Partial<IFixedCost>) {
    return await FixedCostModel.findByIdAndUpdate(id, data, { new: true });
  }

  // 5. Xóa
  async deleteFixedCost(id: string) {
    return await FixedCostModel.findByIdAndDelete(id);
  }
}
