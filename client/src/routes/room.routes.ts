import { PATHS } from "../utils/constants";
import ListRoom from "../pages/Private/RoomManagement/ListRoom";
import DashboardLayout from "../layouts/DashboardLayout";

export const roomRoutes = [{ path: PATHS.SETTINGS_ROOMS, component: ListRoom, layout: DashboardLayout }];