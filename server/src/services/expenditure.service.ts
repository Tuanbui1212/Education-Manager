import { ExpenditureModel } from '../models/expenditure.model';
import { IExpenditure } from '../types/expenditure.type';

export class ExpenditureService {
  async create(data: Partial<IExpenditure>) {
    return await ExpenditureModel.create(data);
  }

  async getAll() {
    //return await ExpenditureModel.find().populate('receiverId', 'fullName email').sort({ date: -1 });
    return await ExpenditureModel.find().sort({ date: -1 });
  }

  async update(id: string, data: Partial<IExpenditure>) {
    return await ExpenditureModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string) {
    return await ExpenditureModel.findByIdAndDelete(id);
  }
}
