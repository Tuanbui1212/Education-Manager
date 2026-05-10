import axios from './axiosClient';
import type { ICashbookItem } from '../types/cashbook.type';

export const cashbookService = {
  getCashBook: async (
    params?: any,
  ): Promise<{ success: boolean; message: string; data: ICashbookItem[]; total: number; summary: any }> => {
    const response = await axios.get('/cashbook', { params });
    return response.data;
  },

  getCashBookById: async ({
    id,
    type,
    table,
  }: {
    id: any;
    type: any;
    table: any;
  }): Promise<{
    success: boolean;
    message: string;
    data: ICashbookItem;
  }> => {
    const params = new URLSearchParams({ type, table });

    const response = await axios.get(`/cashbook/${id}?${params.toString()}`);

    return response.data;
  },
};
