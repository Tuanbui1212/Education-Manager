import axios from './axiosClient';
import type { IExpenditure, CreateExpenditure } from '../types/expenditure.type';

export const expenditureService = {
  getExpenditures: async (params?: any): Promise<{ success: boolean; message: string; data: any; total: number }> => {
    const response = await axios.get('/expenditures', { params });
    return response.data;
  },

  createExpenditures: async (
    data: CreateExpenditure,
  ): Promise<{ success: boolean; message: string; data: IExpenditure }> => {
    const response = await axios.post('/expenditures/create', data);
    return response.data;
  },

  getExpendituresById: async (id: any): Promise<{ success: boolean; message: string; data: IExpenditure }> => {
    const response = await axios.get(`/expenditures/${id}`);
    return response.data;
  },
};
