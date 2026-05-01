import { pipeline } from 'stream';
import { ExpenditureModel } from '../models/expenditure.model';
import { IExpenditure } from '../types/expenditure.type';

export class ExpenditureService {
  async create(data: Partial<IExpenditure>) {
    return await ExpenditureModel.create(data);
  }

  async getAll() {
    return await ExpenditureModel.find().sort({ date: -1 });
  }

  async update(id: string, data: Partial<IExpenditure>) {
    return await ExpenditureModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string) {
    return await ExpenditureModel.findByIdAndDelete(id);
  }

  async getById(id: string) {
    const expenditure = await ExpenditureModel.aggregate([
      { $match: { _id: id } },
      {
        $lookup: {
          from: 'payrolls',
          localField: 'payrollId',
          foreignField: '_id',
          as: 'payroll',
        },
      },
      {
        $unwind: '$payroll',
      },
      {
        $lookup: {
          from: 'users',
          let: { receiverId: '$receiverId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$receiverId'] },
              },
            },
            {
              $lookup: {
                from: 'roles',
                let: { roleId: '$roleId' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$roleId'] },
                    },
                  },
                  {
                    $project: { name: 1 },
                  },
                ],
                as: 'role',
              },
            },
            { $unwind: '$role' },
            {
              $project: {
                fullName: 1,
                email: 1,
                phone: 1,
                role: 1,
              },
            },
          ],
          as: 'receiver',
        },
      },
      {
        $unwind: '$receiver',
      },
      {
        $lookup: {
          from: 'users',
          let: { paidById: '$paidBy' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$paidById'] },
              },
            },
            {
              $project: {
                fullname: 1,
              },
            },
          ],
          as: 'paidBy',
        },
      },
      {
        $unwind: '$paidBy',
      },
    ]);
    return expenditure;
  }
}
