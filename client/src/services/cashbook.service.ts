import axios from './axiosClient';
import type { ICashbookItem } from '../types/cashbookItem.type';

export const cashbookService = {
  getCashBook: async (
    params?: any,
  ): Promise<{ success: boolean; message: string; data: ICashbookItem[]; total: number; summary: any }> => {
    const response = await axios.get('/cashbook', { params });
    return response.data;
  },
};
