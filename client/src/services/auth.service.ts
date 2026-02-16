import axiosClient from "./axiosClient";

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axiosClient.post("/login", { email, password });
    return response.data;
  },
};
