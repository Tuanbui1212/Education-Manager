import axios from './axiosClient';

import type { GetShiftsParams, IShift } from '../types/shift.type';

export const shiftService = {
  getShifts: async (
    params?: GetShiftsParams,
  ): Promise<{ success: boolean; data?: IShift[]; totalCount: number; message: string }> => {
    const response = await axios.get('/shifts', { params });
    return response.data;
  },

  getShiftById: async (
    id: string,
  ): Promise<{ success: boolean; data?: IShift; message: string; totalCount: number }> => {
    const response = await axios.get(`/shifts/${id}`);
    return response.data;
  },

  createShift: async (shiftData: Partial<IShift>): Promise<{ success: boolean; message: string; data?: IShift }> => {
    const response = await axios.post('/shifts', shiftData);
    return response.data;
  },
  updateShift: async (
    id: string,
    shiftData: Partial<IShift>,
  ): Promise<{ success: boolean; message: string; data?: IShift }> => {
    const response = await axios.put(`/shifts/${id}`, shiftData);
    return response.data;
  },
  deleteShift: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/shifts/${id}`);
    return response.data;
  },
};
