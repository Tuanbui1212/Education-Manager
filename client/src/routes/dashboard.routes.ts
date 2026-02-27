import { PATHS } from '../utils/constants';

import HomePage from '../pages/Private/HomePage';
import DashboardLayout from '../layouts/DashboardLayout';

export const dashboardRoutes = [{ path: PATHS.DASHBOARD, component: HomePage, layout: DashboardLayout }];
