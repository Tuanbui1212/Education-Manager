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
  ): Promise<{ success: boolean; message: string; data: ITransaction[]; total: number; summary: any }> => {
    const response = await axios.get('/transactions', { params });
    return response.data;
  },

  createTransactionTest: async (
    data: Partial<ITransaction>,
  ): Promise<{ success: boolean; message: string; data?: ITransaction }> => {
    const response = await axios.post('/transactions/test', data);
    return response.data;
  },

  getTransactionsById: async (id: any): Promise<{ success: boolean; message: string; data: ITransaction }> => {
    const safeId = typeof id === 'object' ? id.id : id;

    const response = await axios.get(`/transactions/${safeId}`);
    return response.data;
  },
};
