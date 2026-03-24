import { lazy } from 'react';
import { PATHS } from '../utils/constants';
import DashboardLayout from '../layouts/DashboardLayout';

const AttendanceManagement = lazy(() => import('../pages/Private/TrainingManagement/AttendanceManagement/AttendanceManagement'));
const AttendanceSchedules = lazy(() => import('../pages/Private/TrainingManagement/AttendanceManagement/AttendanceSchedules'));
const AttendanceDetails = lazy(() => import('../pages/Private/TrainingManagement/AttendanceManagement/AttendanceDetails'));

const attendanceRoutes = [
  {
    path: PATHS.TRAINING_ATTENDANCES,
    component: AttendanceManagement,
    layout: DashboardLayout,
  },
  {
    path: `${PATHS.TRAINING_ATTENDANCES}/:classId`,
    component: AttendanceSchedules,
    layout: DashboardLayout,
  },
  {
    path: `${PATHS.TRAINING_ATTENDANCES}/:classId/list/:scheduleId`,
    component: AttendanceDetails,
    layout: DashboardLayout,
  },
];

export default attendanceRoutes;
