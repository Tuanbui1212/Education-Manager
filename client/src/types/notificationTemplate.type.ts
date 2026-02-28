export type NotificationType = 'EMAIL' | 'SMS';

export interface GetNotificationTemplatesParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: NotificationType;
}

export interface INotificationTemplate {
    _id?: string;
    title: string;
    content: string;
    type: NotificationType;
    createdAt?: string;
    updatedAt?: string;
}

export interface NotificationTemplateResponse {
    success: boolean;
    message: string;
    data: INotificationTemplate[];
    totalCount: number;
}

export interface NotificationTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<INotificationTemplate>) => void;
    initialData?: INotificationTemplate | null;
    loading?: boolean;
}
