import axios from './axiosClient';
import type { INotificationTemplate, GetNotificationTemplatesParams } from '../types/notificationTemplate.type';

export const notificationTemplateService = {
    getTemplates: async (
        params?: GetNotificationTemplatesParams,
    ): Promise<{ success: boolean; message: string; data?: INotificationTemplate[]; totalCount: number }> => {
        const response = await axios.get('/notification-templates', { params });
        return {
            success: true,
            message: 'Lấy danh sách mẫu thông báo thành công',
            data: response.data.data,
            totalCount: response.data.total,
        };
    },

    getTemplateById: async (id: string): Promise<{ success: boolean; message: string; data?: INotificationTemplate }> => {
        const response = await axios.get(`/notification-templates/${id}`);
        return {
            success: true,
            message: 'Lấy thông tin mẫu thông báo thành công',
            data: response.data.data,
        };
    },

    createTemplate: async (templateData: Partial<INotificationTemplate>): Promise<{ success: boolean; message: string; data?: INotificationTemplate }> => {
        const response = await axios.post('/notification-templates', templateData);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    },

    updateTemplate: async (
        id: string,
        templateData: Partial<INotificationTemplate>,
    ): Promise<{ success: boolean; message: string; data?: INotificationTemplate }> => {
        const response = await axios.put(`/notification-templates/${id}`, templateData);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    },

    deleteTemplate: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await axios.delete(`/notification-templates/${id}`);
        return {
            success: true,
            message: response.data.message,
        };
    },
};
