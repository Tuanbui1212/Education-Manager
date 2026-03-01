import mongoose, { Schema } from 'mongoose';
import { INotificationTemplate, NotificationType } from '../types/notificationTemplate.type';

const NotificationTemplateSchema = new Schema<INotificationTemplate>(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true, trim: true },
        type: { type: String, enum: Object.values(NotificationType), default: NotificationType.EMAIL },
    },
    {
        timestamps: true,
    },
);

export const NotificationTemplateModel = mongoose.model<INotificationTemplate>('NotificationTemplate', NotificationTemplateSchema);
