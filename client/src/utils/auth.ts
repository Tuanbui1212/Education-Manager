import { jwtDecode } from "jwt-decode";
import type { DecodedToken } from "../types/auth.type";

export const getDecodedToken = (): DecodedToken | null => {
  const token = localStorage.getItem("accessToken");

  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (error) {
    console.error("Token lỗi:", error);
    return null;
  }
};
