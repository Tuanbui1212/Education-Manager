import { PATHS } from '../utils/constants';
import RoleManager from '../pages/Private/AccountManagement/RoleManagement/RoleManager';
import RoleDetail from '../pages/Private/AccountManagement/RoleManagement/RoleDetail';
import DashboardLayout from '../layouts/DashboardLayout';

export const roleRoutes = [
  { path: PATHS.SETTINGS_ROLES, component: RoleManager, layout: DashboardLayout },
  { path: PATHS.ACCOUNT_ROLE_ID, component: RoleDetail, layout: DashboardLayout },
];
