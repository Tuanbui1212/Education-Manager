import axiosClient from './axiosClient';
import type { IFixedCost } from '../types/fixedCost.type';

export const fixedCostService = {
  getFixedCosts: async (
    params?: any,
  ): Promise<{ success: boolean; message: string; data?: IFixedCost[]; totalCount: number }> => {
    const response = await axiosClient.get('/fixed-costs', { params });
    return response.data;
  },

  getFixedCostsById: async (
    id: string,
  ): Promise<{ success: boolean; message: string; data?: IFixedCost; totalCount: number }> => {
    const response = await axiosClient.get(`/fixed-costs/${id}`);
    return response.data;
  },

  createFixedCost: async (
    fixedCostData: Partial<IFixedCost>,
  ): Promise<{ success: boolean; message: string; data?: IFixedCost }> => {
    const response = await axiosClient.post('/fixed-costs', fixedCostData);
    return response.data;
  },

  updateFixedCost: async (
    id: string,
    fixData: Partial<IFixedCost>,
  ): Promise<{ success: boolean; message: string; data?: IFixedCost }> => {
    const response = await axiosClient.put(`/fixed-costs/${id}`, fixData);
    return response.data;
  },

  deleteFixedCost: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.delete(`/fixed-costs/${id}`);
    return response.data;
  },
};
