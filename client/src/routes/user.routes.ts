import { PATHS } from '../utils/constants';

import ListUser from '../pages/Private/Users/ListUser';
import DashboardLayout from '../layouts/DashboardLayout';

export const userRoutes = [{ path: PATHS.USER, component: ListUser, layout: DashboardLayout }];
