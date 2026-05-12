import axios from './axiosClient';
import type { IClassRequest } from '../types/classRequest.type';

export const classRequestService = {
  getClassRequests: async (): Promise<{ success: boolean; data: IClassRequest[] }> => {
    const response = await axios.get('/classRequests');
    return response.data;
  },

  getClassRequestById: async (id: string): Promise<{ success: boolean; data: IClassRequest }> => {
    const response = await axios.get(`/classRequests/${id}`);
    return response.data;
  },

  createClassRequest: async (idClassRequests: string[]): Promise<{ success: boolean; data: any }> => {
    const response = await axios.post('/classRequests', { idClassRequests });
    return response.data;
  },

  updateClassRequest: async (
    id: string,
    updateData: Partial<IClassRequest>,
  ): Promise<{ success: boolean; data: any }> => {
    const response = await axios.put(`/classRequests/${id}`, updateData);
    return response.data;
  },

  deleteMyClassRequests: async (): Promise<{ success: boolean }> => {
    const response = await axios.delete('/classRequests');
    return response.data;
  },

  runGeneticAlgorithm: async (): Promise<{ success: boolean; data: any }> => {
    const response = await axios.post('/classRequests/runGA');
    return response.data;
  },
};
