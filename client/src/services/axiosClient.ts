import axios from "axios";
import { API_ROOT } from "../utils/constants";

const axiosClient = axios.create({
  baseURL: API_ROOT || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err),
);

export default axiosClient;
