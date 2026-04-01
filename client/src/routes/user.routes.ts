import { PATHS } from '../utils/constants';

import ListUser from '../pages/Private/Users/ListUser';
import UserForm from '../pages/Private/Users/UserForm';

import StudentManager from '../pages/Private/StudentManagement/StudentManagement';
import StudentDetail from '../pages/Private/StudentManagement/StudentDetail';

import TeacherManager from '../pages/Private/TeacherManagement/TeacherManager';
import TeacherDetail from '../pages/Private/TeacherManagement/TeacherDetail';
import TeacherForm from '../pages/Private/TeacherManagement/TeacherForm';

import StaffManager from '../pages/Private/StaffManagement/StaffManager';
import StaffDetail from '../pages/Private/StaffManagement/StaffDetail';
import StaffForm from '../pages/Private/StaffManagement/StaffForm';

import UserProfileForm from '../pages/Private/MyManagement/UserProfileForm';
import UserProfile from '../pages/Private/MyManagement/UserProfile';

import DashboardLayout from '../layouts/DashboardLayout';
import { Fragment } from 'react/jsx-runtime';
import { Import } from 'lucide-react';

export const userRoutes = [
  { path: PATHS.USER, component: ListUser, layout: DashboardLayout },
  { path: PATHS.ACCOUNT_USERS_CREATE, component: UserForm, layout: DashboardLayout },
  { path: PATHS.ACCOUNT_USERS_EDIT, component: UserForm, layout: DashboardLayout },

  { path: PATHS.TRAINING_STUDENT, component: StudentManager, layout: DashboardLayout },
  { path: PATHS.TRAINING_STUDENT_ID, component: StudentDetail, layout: DashboardLayout },

  { path: PATHS.HR_TEACHERS, component: TeacherManager, layout: DashboardLayout },
  { path: PATHS.HR_TEACHERS_ID, component: TeacherDetail, layout: DashboardLayout },
  { path: PATHS.HR_TEACHERS_CREATE, component: TeacherForm, layout: DashboardLayout },
  { path: PATHS.HR_TEACHERS_EDIT, component: TeacherForm, layout: DashboardLayout },

  { path: PATHS.HR_STAFFS, component: StaffManager, layout: DashboardLayout },
  { path: PATHS.HR_STAFFS_ID, component: StaffDetail, layout: DashboardLayout },
  { path: PATHS.HR_STAFFS_CREATE, component: StaffForm, layout: DashboardLayout },
  { path: PATHS.HR_STAFFS_EDIT, component: StaffForm, layout: DashboardLayout },

  { path: PATHS.PROFILE_STUDENT, component: UserProfileForm, layout: Fragment },
  { path: PATHS.PROFILE_STAFF, component: UserProfileForm, layout: DashboardLayout },

  { path: PATHS.PROFILE_TEACHER, component: UserProfile, layout: DashboardLayout },
];
