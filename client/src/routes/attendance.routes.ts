import { lazy } from 'react';
import { PATHS } from '../utils/constants';
import DashboardLayout from '../layouts/DashboardLayout';

const AttendanceManagement = lazy(() => import('../pages/Private/TrainingManagement/AttendanceManagement/AttendanceManagement'));

const attendanceRoutes = [
  {
    path: PATHS.TRAINING_ATTENDANCES,
    component: AttendanceManagement,
    layout: DashboardLayout,
  },
];

export default attendanceRoutes;
