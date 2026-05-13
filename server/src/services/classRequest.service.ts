import mongoose, { Types } from 'mongoose';
import { ClassRequestModel } from '../models/classRequest.model';
import { ClassModel } from '../models/class.model';
import { IClassRequest } from '../types/classRequest.type';

export class ClassRequestService {
  // Tạo nhiều class request từ danh sách id class
  async createClassRequest(idClassRequests: string[], creatorId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const createdClasses = [];
      for (const id of idClassRequests) {
        const classData = await ClassModel.findById(id).session(session);
        if (!classData) {
          throw new Error(`Không tìm thấy lớp học với ID: ${id}`);
        }
        const classRequestData = {
          creatorId: new Types.ObjectId(creatorId),
          name: classData?.name,
          courseId: classData?.courseId,
          teacherId: classData?.teacherId,
          roomId: classData?.roomId,
          startDate: classData?.startDate,
          totalLessons: classData?.totalLessons,
          maxNumberOfStudents: classData?.maxNumberOfStudents,
          lessonsPerWeek: classData?.lessonsPerWeek,
          optionalRequirements: classData?.optionalRequirements,
        };

        createdClasses.push(classRequestData);
      }

      await ClassRequestModel.insertMany(createdClasses, { session });
      await session.commitTransaction();
      return createdClasses;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // Lấy tất cả class request
  async getAllClassRequests(creatorId: string) {
    return await ClassRequestModel.find({ creatorId })
      .populate('creatorId', 'fullName')
      .populate('courseId', 'title')
      .populate('teacherId', 'fullName')
      .populate('roomId', 'name');
  }

  // Lấy class request theo ID
  async getClassRequestById(id: string) {
    return await ClassRequestModel.findById(id);
  }

  // Sửa class request
  async updateClassRequest(id: string, updateData: Partial<IClassRequest>) {
    return await ClassRequestModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Xóa class request khi tôi quay về bước 1 hoặc hoàn thành bước 3
  async deleteAllClassRequestById(creatorId: string) {
    console.log('Xóa tất cả class request của creatorId:', creatorId);
    return await ClassRequestModel.deleteMany({
      creatorId: new mongoose.Types.ObjectId(creatorId),
    });
  }
}
