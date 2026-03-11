import { PATHS } from '../utils/constants';

import ListUser from '../pages/Private/Users/ListUser';
import StudentManager from '../pages/Private/StudentManagement/StudentManagement';
import TeacherManager from '../pages/Private/TeacherManagement/TeacherManager';
import TeacherDetail from '../pages/Private/TeacherManagement/TeacherDetail';

import DashboardLayout from '../layouts/DashboardLayout';

export const userRoutes = [
  { path: PATHS.USER, component: ListUser, layout: DashboardLayout },
  { path: PATHS.TRANINING_STUDENT, component: StudentManager, layout: DashboardLayout },
  { path: PATHS.HR_TEACHERS, component: TeacherManager, layout: DashboardLayout },
  { path: PATHS.HR_TEACHERS_ID, component: TeacherDetail, layout: DashboardLayout },
];
