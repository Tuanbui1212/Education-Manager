import axios from './axiosClient';

export const expenditureService = {
  getExpenditures: async (params?: any): Promise<{ success: boolean; message: string; data: any; total: number }> => {
    const response = await axios.get('/expenditures', { params });
    return response.data;
  },
};
