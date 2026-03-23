import axios from './axiosClient';
import type { IInvoice, CreateInvoiceType } from '../types/invoice.type';

export const invoiceService = {
  getInvoices: async (
    params?: any,
  ): Promise<{ success: boolean; message: string; data?: IInvoice[]; totalCount: number }> => {
    const response = await axios.get('/invoices', { params });
    return response.data;
  },

  getInvoiceById: async (id: any): Promise<{ success: boolean; message: string; data?: IInvoice }> => {
    const response = await axios.get(`/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (
    invoiceData: Partial<CreateInvoiceType>,
  ): Promise<{ success: boolean; message: string; data?: IInvoice }> => {
    const response = await axios.post('/invoices', invoiceData);
    return response.data;
  },

  updateInvoice: async (
    id: string,
    invoiceData: Partial<CreateInvoiceType>,
  ): Promise<{ success: boolean; message: string; data?: IInvoice }> => {
    const response = await axios.put(`/invoices/${id}`, invoiceData);
    return response.data;
  },

  deleteInvoice: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/invoices/${id}`);
    return response.data;
  },

  setupInstallment: async (
    id: string,
    data: { totalMonths: number },
  ): Promise<{ success: boolean; message: string; data?: IInvoice }> => {
    const response = await axios.put(`/invoices/${id}/installment`, data);
    return response.data;
  },
};
