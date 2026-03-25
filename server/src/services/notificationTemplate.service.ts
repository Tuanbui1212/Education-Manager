import {
  CreateNotificationTemplateType,
  UpdateNotificationTemplateType,
} from '@/validations/notificationTemplate.validation';
import { NotificationTemplateModel } from '../models/notificationTemplate.model';
import { INotificationTemplate } from '../types/notificationTemplate.type';
import { GetNotificationTemplatesQuery } from '@/types/notificationTemplate.type';

export class NotificationTemplateService {
  async createNotificationTemplate(data: CreateNotificationTemplateType): Promise<INotificationTemplate> {
    const existingTemplate = await NotificationTemplateModel.findOne({ code: data.code });
    if (existingTemplate) {
      throw new Error(`Sự kiện này đã được tạo mẫu thông báo!`);
    }

    const newTemplate = new NotificationTemplateModel(data);
    return await newTemplate.save();
  }

  async getAllNotificationTemplates(query: GetNotificationTemplatesQuery): Promise<{
    notificationTemplates: INotificationTemplate[];
    total: number;
  }> {
    const { page = 1, limit = 10, search = '', type } = query;
    const skip = (page - 1) * limit;

    const filter: any = {
      title: { $regex: search, $options: 'i' },
    };
    if (type) {
      filter.type = String(type).toUpperCase();
    }

    const [total, notificationTemplates] = await Promise.all([
      NotificationTemplateModel.countDocuments(filter),
      NotificationTemplateModel.find(filter).sort({ title: 1 }).skip(skip).limit(limit),
    ]);
    return { notificationTemplates, total };
  }

  async getNotificationTemplateById(id: string): Promise<INotificationTemplate | null> {
    return await NotificationTemplateModel.findById(id);
  }

  async updateNotificationTemplate(
    id: string,
    data: UpdateNotificationTemplateType,
  ): Promise<INotificationTemplate | null> {
    if (data.code) {
      const existingTemplate = await NotificationTemplateModel.findOne({
        code: data.code,
        _id: { $ne: id },
      });
      if (existingTemplate) {
        throw new Error(`Sự kiện này đã được sử dụng bởi mẫu khác!`);
      }
    }
    return await NotificationTemplateModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteNotificationTemplate(id: string): Promise<INotificationTemplate | null> {
    return await NotificationTemplateModel.findByIdAndDelete(id);
  }
}
