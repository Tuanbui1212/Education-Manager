import { PATHS } from '../utils/constants';

import ListUser from '../pages/Private/Users/ListUser';

import StudentManager from '../pages/Private/StudentManagement/StudentManagement';
import StudentDetail from '../pages/Private/StudentManagement/StudentDetail';

import TeacherManager from '../pages/Private/TeacherManagement/TeacherManager';
import TeacherDetail from '../pages/Private/TeacherManagement/TeacherDetail';

import StaffManager from '../pages/Private/StaffManagement/StaffManager';
import StaffDetail from '../pages/Private/StaffManagement/StaffDetail';

import UserProfileForm from '../pages/Private/MyManagement/UserProfileForm';

import DashboardLayout from '../layouts/DashboardLayout';
import { Fragment } from 'react/jsx-runtime';

export const userRoutes = [
  { path: PATHS.USER, component: ListUser, layout: DashboardLayout },

  { path: PATHS.TRANINING_STUDENT, component: StudentManager, layout: DashboardLayout },
  { path: PATHS.TRANINING_STUDENT_ID, component: StudentDetail, layout: DashboardLayout },

  { path: PATHS.HR_TEACHERS, component: TeacherManager, layout: DashboardLayout },
  { path: PATHS.HR_TEACHERS_ID, component: TeacherDetail, layout: DashboardLayout },

  { path: PATHS.HR_STAFFS, component: StaffManager, layout: DashboardLayout },
  { path: PATHS.HR_STAFFS_ID, component: StaffDetail, layout: DashboardLayout },

  { path: PATHS.PROFILE_STUDENT, component: UserProfileForm, layout: Fragment },
  { path: PATHS.PROFILE_STAFF, component: UserProfileForm, layout: DashboardLayout },
];
