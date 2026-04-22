import axios from './axiosClient';
import type { GetSchedulesParams, ISchedule } from '../types/schedule.type';

export const scheduleService = {
  getSchedules: async (
    params?: GetSchedulesParams,
  ): Promise<{ success: boolean; data: ISchedule[]; total: number; message: string }> => {
    const response = await axios.get('/schedules', { params });
    return response.data;
  },

  getScheduleById: async (id: string): Promise<{ success: boolean; data: ISchedule; message: string }> => {
    const response = await axios.get(`/schedules/${id}`);
    return response.data;
  },

  createSchedule: async (
    scheduleData: Partial<ISchedule>,
  ): Promise<{ success: boolean; message: string; data: ISchedule }> => {
    const response = await axios.post('/schedules', scheduleData);
    return response.data;
  },

  updateSchedule: async (
    id: string,
    scheduleData: Partial<ISchedule>,
  ): Promise<{ success: boolean; message: string; data: ISchedule }> => {
    const response = await axios.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },

  deleteSchedule: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/schedules/${id}`);
    return response.data;
  },

  createSchedulesBulk: async (
    schedules: Partial<ISchedule>[],
    startDate: string,
  ): Promise<{ success: boolean; message: string; data: ISchedule[] }> => {
    const response = await axios.post(`/schedules/bulk`, { schedules, startDate });
    return response.data;
  },

  deleteSchedulesBulk: async (ids: string[]): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/schedules/bulk`, { data: { ids } });
    return response.data;
  },

  getStartDateClass: async (classId: string): Promise<{ success: boolean; message: string; data?: string }> => {
    const response = await axios.get(`/schedules/class/${classId}/start-date`);
    return response.data;
  },
};
