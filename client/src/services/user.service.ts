import axios from './axiosClient';

import type { IUser, GetUsersParams } from '../types/user.type';

export const userService = {
  getUsers: async (
    params?: GetUsersParams,
  ): Promise<{ success: boolean; message: string; data?: IUser[]; totalCount: number }> => {
    const response = await axios.get('/users', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<{ success: boolean; message: string; data?: IUser }> => {
    const response = await axios.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: Partial<IUser>): Promise<{ success: boolean; message: string; data?: IUser }> => {
    const response = await axios.post('/users', userData);
    return response.data;
  },

  updateUser: async (
    id: string,
    userData: Partial<IUser>,
  ): Promise<{ success: boolean; message: string; data?: IUser }> => {
    const response = await axios.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/users/${id}`);
    return response.data;
  },
};
