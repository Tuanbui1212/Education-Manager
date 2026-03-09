import axios from './axiosClient';
import type { IClass, GetClassesParams, GetStudentsByClassParams } from '../types/class.type';

export const classService = {
    getClasses: async (params?: GetClassesParams) => {
        const response = await axios.get('/classes', { params });
        return {
            success: true,
            data: response.data.data,
            message: response.data.message || 'Lấy danh sách thành công',
            totalCount: response.data.total,
        };
    },

    getClassById: async (id: string) => {
        const response = await axios.get(`/classes/${id}`);
        return response.data;
    },

    createClass: async (data: Partial<IClass>) => {
        const response = await axios.post('/classes', data);
        return response.data;
    },

    updateClass: async (id: string, data: Partial<IClass>) => {
        const response = await axios.put(`/classes/${id}`, data);
        return response.data;
    },

    deleteClass: async (id: string) => {
        const response = await axios.delete(`/classes/${id}`);
        return response.data;
    },

    getStudentsByClass: async (id: string, params?: GetStudentsByClassParams) => {
        const response = await axios.get(`/classes/${id}/students`, { params });
        return {
            success: true,
            data: response.data.data,
            message: response.data.message || 'Lấy danh sách thành công',
            totalCount: response.data.total,
        };
    }
};
