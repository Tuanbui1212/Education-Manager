import axios from './axiosClient';
import type { IAttendance, IAttendanceRecord, IScheduleStat, IActiveClass } from '../types/attendance.type';

export const attendanceService = {
    getActiveClasses: async (
        params?: { page?: number; limit?: number; search?: string; }
    ): Promise<{ success: boolean; data: IActiveClass[]; totalCount: number; message: string }> => {
        const response = await axios.get('/attendances', { params });
        return response.data;
    },

    getSchedulesByClass: async (
        params: { classId: string; page?: number; limit?: number; }
    ): Promise<{ success: boolean; data: IScheduleStat[]; totalCount: number; message: string }> => {
        const { classId, ...queryParams } = params;
        const response = await axios.get(`/attendances/${classId}`, { params: queryParams });
        return response.data;
    },

    getAttendanceList: async (
        params: { classId: string; scheduleId: string; page?: number; limit?: number; }
    ): Promise<{ success: boolean; data: IAttendanceRecord[]; totalCount: number; message: string }> => {
        const { classId, scheduleId, ...queryParams } = params;
        const response = await axios.get(`/attendances/${classId}/list/${scheduleId}`, { params: queryParams });
        return response.data;
    },

    upsertAttendances: async (
        attendanceData: IAttendance[]
    ): Promise<{ success: boolean; message: string }> => {
        const response = await axios.post('/attendances', attendanceData);
        return response.data;
    },

    getStudentAttendancesByClass: async (
        classId: string
    ): Promise<{ success: boolean; data: any[]; message: string }> => {
        const response = await axios.get(`/attendances/student-class/${classId}`);
        return response.data;
    },
};
