import SinhVienPage from "../pages/SinhVien";
import BangDiemPage from "../pages/BangDiem";
import { PATHS } from "../utils/constants";

export const publicRoutes = [
  { path: PATHS.HOME, component: SinhVienPage },
  { path: PATHS.BANG_DIEM, component: BangDiemPage },
];
