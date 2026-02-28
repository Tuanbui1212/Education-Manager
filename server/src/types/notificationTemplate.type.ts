import { Document } from "mongoose";

export enum NotificationType {
    EMAIL = "EMAIL",
    SMS = "SMS"
}

export interface INotificationTemplate extends Document {
    title: string,
    content: string,
    type: NotificationType
}

export interface GetNotificationTemplatesQuery {
    page?: number;
    limit?: number;
    search?: string;
    type?: NotificationType;
}