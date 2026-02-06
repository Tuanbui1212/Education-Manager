import axios from "axios";
import { API_ROOT } from "../utils/constants";

const axiosClient = axios.create({
  baseURL: API_ROOT,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default axiosClient;
