import { Request, Response } from "express";
import { NotificationTemplateService } from "../services/notificationTemplate.service";
import {
    CreateNotificationTemplateType,
    NotificationTemplateIdType,
    UpdateNotificationTemplateType,
} from "../validations/notificationTemplate.validation";
import { GetNotificationTemplatesQuery } from "../types/notificationTemplate.type";

export class NotificationTemplateController {
    private notificationTemplateService = new NotificationTemplateService();
    // [POST] /api/notification-templates
    create = async (req: Request<any, any, CreateNotificationTemplateType>, res: Response) => {
        try {
            const notificationTemplate = await this.notificationTemplateService.createNotificationTemplate(req.body);
            res.status(201).json({ message: "Tạo mẫu thông báo thành công", data: notificationTemplate });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    };

    // [GET] /api/notification-templates
    getAll = async (req: Request<{}, {}, {}, GetNotificationTemplatesQuery>, res: Response) => {
        try {
            const { notificationTemplates, total } = await this.notificationTemplateService.getAllNotificationTemplates(req.query);
            res.status(200).json({ data: notificationTemplates, total });
        } catch (error) {
            res.status(500).json({ message: "Lỗi Server" });
        }
    };

    // [GET] /api/notification-templates/:id
    getOne = async (req: Request<NotificationTemplateIdType>, res: Response) => {
        try {
            const { id } = req.params;
            const notificationTemplate = await this.notificationTemplateService.getNotificationTemplateById(id);
            if (!notificationTemplate)
                return res.status(404).json({ message: "Không tìm thấy mẫu thông báo" });
            res.status(200).json({ data: notificationTemplate });
        } catch (error) {
            res.status(500).json({ message: "Lỗi Server" });
        }
    };

    // [PUT] /api/notification-templates/:id
    update = async (
        req: Request<NotificationTemplateIdType, any, UpdateNotificationTemplateType>,
        res: Response,
    ) => {
        try {
            const { id } = req.params;
            const notificationTemplate = await this.notificationTemplateService.updateNotificationTemplate(id, req.body);
            if (!notificationTemplate)
                return res.status(404).json({ message: "Không tìm thấy mẫu thông báo để sửa" });
            res.status(200).json({ message: "Cập nhật thành công", data: notificationTemplate });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    };

    // [DELETE] /api/notification-templates/:id
    delete = async (req: Request<NotificationTemplateIdType>, res: Response) => {
        try {
            const { id } = req.params;
            const notificationTemplate = await this.notificationTemplateService.deleteNotificationTemplate(id);
            if (!notificationTemplate)
                return res.status(404).json({ message: "Không tìm thấy mẫu thông báo để xóa" });
            res.status(200).json({ message: "Xóa thành công" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi Server" });
        }
    };
}
