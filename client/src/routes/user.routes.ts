import { PATHS } from '../utils/constants';

import ListUser from '../pages/Private/Users/ListUser';
import StudentManager from '../pages/Private/StudentManagement/StudentManagement';
import DashboardLayout from '../layouts/DashboardLayout';

export const userRoutes = [
  { path: PATHS.USER, component: ListUser, layout: DashboardLayout },
  { path: PATHS.TRANINING_STUDENT, component: StudentManager, layout: DashboardLayout },
];
