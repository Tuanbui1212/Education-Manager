import { CreateNotificationTemplateType, UpdateNotificationTemplateType } from "@/validations/notificationTemplate.validation";
import { NotificationTemplateModel } from "../models/notificationTemplate.model";
import { INotificationTemplate } from "../types/notificationTemplate.type";
import { GetNotificationTemplatesQuery } from "@/types/notificationTemplate.type";

export class NotificationTemplateService {
    // 1. Tạo phòng mới
    async createNotificationTemplate(data: CreateNotificationTemplateType): Promise<INotificationTemplate> {
        const existingRoom = await NotificationTemplateModel.findOne({ title: data.title });
        if (existingRoom) {
            throw new Error(`Tiêu đề ${data.title} đã tồn tại!`);
        }

        const newRoom = new NotificationTemplateModel(data);
        return await newRoom.save();
    }

    // 2. Lấy danh sách phòng
    async getAllNotificationTemplates(query: GetNotificationTemplatesQuery): Promise<{
        notificationTemplates: INotificationTemplate[];
        total: number;
    }> {
        const { page = 1, limit = 10, search = "", type } = query;
        const skip = (page - 1) * limit;

        const filter: any = {
            title: { $regex: search, $options: "i" },
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

    // 3. Lấy chi tiết 1 phòng
    async getNotificationTemplateById(id: string): Promise<INotificationTemplate | null> {
        return await NotificationTemplateModel.findById(id);
    }

    // 4. Cập nhật phòng
    async updateNotificationTemplate(id: string, data: UpdateNotificationTemplateType): Promise<INotificationTemplate | null> {
        if (data.title) {
            const existingRoom = await NotificationTemplateModel.findOne({
                title: data.title,
                _id: { $ne: id },
            });
            if (existingRoom) {
                throw new Error(
                    `Tiêu đề ${data.title} đã được sử dụng bởi mẫu khác!`,
                );
            }
        }
        return await NotificationTemplateModel.findByIdAndUpdate(id, data, { new: true });
    }

    // 5. Xóa phòng
    async deleteNotificationTemplate(id: string): Promise<INotificationTemplate | null> {
        return await NotificationTemplateModel.findByIdAndDelete(id);
    }
}
