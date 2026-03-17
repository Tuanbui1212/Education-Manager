import { PATHS } from '../utils/constants';
import ListRoom from '../pages/Private/RoomManagement/ListRoom';
import RoomDetail from '../pages/Private/RoomManagement/RoomDetail';
import DashboardLayout from '../layouts/DashboardLayout';

export const roomRoutes = [
  { path: PATHS.SETTINGS_ROOMS, component: ListRoom, layout: DashboardLayout },
  { path: PATHS.SETTINGS_ROOMS_ID, component: RoomDetail, layout: DashboardLayout },
];
