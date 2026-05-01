import axiosClient from './axiosClient';
import type { IPayroll } from '../types/payRoll.type';

export const payrollService = {
  getPayrolls: async (
    params?: any,
  ): Promise<{ success: boolean; message: string; data?: IPayroll[]; totalCount: number }> => {
    const response = await axiosClient.get('/payrolls', { params });
    return response.data;
  },

  getPayrollById: async (id: string): Promise<{ success: boolean; message: string; data?: IPayroll }> => {
    const response = await axiosClient.get(`/payrolls/${id}`);
    return response.data;
  },

  createPayroll: async (
    payrollData: Partial<IPayroll>,
  ): Promise<{ success: boolean; message: string; data?: IPayroll }> => {
    const response = await axiosClient.post('/payrolls', payrollData);
    return response.data;
  },

  updatePayroll: async (
    id: string,
    payrollData: Partial<IPayroll>,
  ): Promise<{ success: boolean; message: string; data?: IPayroll }> => {
    const response = await axiosClient.put(`/payrolls/${id}`, payrollData as any);
    return response.data;
  },

  deletePayroll: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.delete(`/payrolls/${id}`);
    return response.data;
  },

  generatePayrollForMonth: async (
    month: string,
  ): Promise<{ success: boolean; message: string; count: number; data: IPayroll[] }> => {
    const response = await axiosClient.post('/payrolls/generate', { month });
    return response.data;
  },

  generatePayrollForUsers: async (
    userIds: string[],
    month: string,
  ): Promise<{ success: boolean; message: string; count: number }> => {
    const response = await axiosClient.post('/payrolls/generatePayrollForUsers', { userIds, month });
    return response.data;
  },

  sendPayrollEmail: async (payrollIds: string[]): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.post('/payrolls/send-email', { payrollIds });
    return response.data;
  },

  markPayrollsAsPaid: async (payrollIds: string[]): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.post('/payrolls/mark-paid', { payrollIds });
    return response.data;
  },

  exportPayrollToExcel: async (month: string): Promise<Blob> => {
    const response = await axiosClient.get(`/payrolls/export?month=${month}`, {
      responseType: 'blob',
    });

    return response.data;
  },
};
