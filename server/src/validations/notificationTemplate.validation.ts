import { z } from "zod"
import { NotificationType } from "../types/notificationTemplate.type"

export const CreateNotificationTemplateSchema = z.object({
    title: z.string({ message: 'Tiêu đề là bắt buộc' }).min(1, "Tiêu đề không được để trống").max(150, "Tiêu đề không quá 150 ký tự"),
    content: z.string({ message: 'Nội dung là bắt buộc' }).min(1, "Nội dung không được để trống"),
    type: z.enum(NotificationType, { message: 'Loại thông báo không hợp lệ' }).default(NotificationType.EMAIL),
})

export const NotificationTemplateIdSchema = z.object({
    id: z.string({ message: 'ID thông báo là bắt buộc' }).trim().min(1, 'ID thông báo không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'),
})

export const UpdateNotificationTemplateSchema = CreateNotificationTemplateSchema.partial()

export type CreateNotificationTemplateType = z.infer<typeof CreateNotificationTemplateSchema>
export type UpdateNotificationTemplateType = z.infer<typeof UpdateNotificationTemplateSchema>
export type NotificationTemplateIdType = z.infer<typeof NotificationTemplateIdSchema>
