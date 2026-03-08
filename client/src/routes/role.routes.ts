import { PATHS } from '../utils/constants';
import RoleManager from '../pages/Private/RoleManagement/RoleManager';
import DashboardLayout from '../layouts/DashboardLayout';

export const roleRoutes = [{ path: PATHS.SETTINGS_ROLES, component: RoleManager, layout: DashboardLayout }];
