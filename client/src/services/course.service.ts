import axios from './axiosClient';
import type { ICourse, GetCoursesParams } from '../types/course.type';

export const courseService = {
    getCourses: async (
        params?: GetCoursesParams,
    ): Promise<{ success: boolean; message: string; data?: ICourse[]; totalCount: number }> => {
        const response = await axios.get('/courses', { params });
        return {
            success: true,
            message: 'Lấy danh sách khóa học thành công',
            data: response.data.data,
            totalCount: response.data.totalCount,
        };
    },

    getCourseById: async (id: string): Promise<{ success: boolean; message: string; data?: ICourse }> => {
        const response = await axios.get(`/courses/${id}`);
        return {
            success: true,
            message: 'Lấy thông tin khóa học thành công',
            data: response.data.data,
        };
    },

    createCourse: async (courseData: Partial<ICourse>): Promise<{ success: boolean; message: string; data?: ICourse }> => {
        const response = await axios.post('/courses', courseData);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    },

    updateCourse: async (
        id: string,
        courseData: Partial<ICourse>,
    ): Promise<{ success: boolean; message: string; data?: ICourse }> => {
        const response = await axios.put(`/courses/${id}`, courseData);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    },

    deleteCourse: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await axios.delete(`/courses/${id}`);
        return {
            success: true,
            message: response.data.message,
        };
    },
};
