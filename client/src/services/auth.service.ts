import axiosClient from './axiosClient';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await axiosClient.post('/auth/reset-password', { token, newPassword: password });
    return response.data;
  },
};
