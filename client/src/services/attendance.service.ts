import axios from './axiosClient';
import type { IAttendance, IAttendanceRecord, IScheduleStat } from '../types/attendance.type';

export const attendanceService = {
    getScheduleStats: async (
        params?: { page?: number; limit?: number; classId?: string; shiftId?: string; }
    ): Promise<{ success: boolean; data: IScheduleStat[]; totalCount: number; message: string }> => {
        const response = await axios.get('/attendances', { params });
        return response.data;
    },

    getAttendanceBySchedule: async (
        scheduleId: string
    ): Promise<{ success: boolean; data: IAttendanceRecord[]; message: string }> => {
        const response = await axios.get(`/attendances/${scheduleId}`);
        return response.data;
    },

    upsertAttendances: async (
        attendanceData: IAttendance[]
    ): Promise<{ success: boolean; message: string }> => {
        const response = await axios.post('/attendances', attendanceData);
        return response.data;
    },
};
