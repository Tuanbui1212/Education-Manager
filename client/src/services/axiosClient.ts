import axios from "axios";
import { API_ROOT } from "../utils/constants";

const axiosClient = axios.create({
  baseURL: API_ROOT || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// axiosClient.interceptors.response.use(
//   (res) => res,
//   (err) => Promise.reject(err),
// );

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
      alert("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại!");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default axiosClient;
