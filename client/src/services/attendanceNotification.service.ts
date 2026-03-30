import axios from './axiosClient';

export const attendanceNotificationService = {
    getNotifications: async (params?: { page?: number; limit?: number; isRead?: boolean }) => {
        const response = await axios.get('/attendance-notifications', { params });
        return response.data;
    },

    markAsRead: async (id: string) => {
        const response = await axios.put(`/attendance-notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await axios.put('/attendance-notifications/read-all');
        return response.data;
    },

    deleteAllRead: async () => {
        const response = await axios.delete('/attendance-notifications/read');
        return response.data;
    }
};
