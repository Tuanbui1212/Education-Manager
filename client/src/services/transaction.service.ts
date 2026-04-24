import axios from './axiosClient';
import type { ITransaction, CreateTransactionDTO } from '../types/transaction.type';

export const transactionService = {
  createTransaction: async (
    data: CreateTransactionDTO,
  ): Promise<{
    success: boolean;
    message: string;
    data?: { transaction: ITransaction; remainingDebt: number; invoiceStatus: string; updatedConfig?: any };
  }> => {
    const response = await axios.post('/transactions', data);
    return response.data;
  },

  getTransactions: async (
    params?: any,
  ): Promise<{ success: boolean; message: string; data: ITransaction[]; total: number }> => {
    const response = await axios.get('/transactions', { params });
    return response.data;
  },
};
