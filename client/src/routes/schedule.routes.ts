import { lazy } from 'react';
import { PATHS } from '../utils/constants';
import DashboardLayout from '../layouts/DashboardLayout';

const ScheduleManagement = lazy(() => import('../pages/Private/TrainingManagement/ScheduleManagement/ScheduleManagement'));

const scheduleRoutes = [
  {
    path: PATHS.TRAINING_SCHEDULES,
    component: ScheduleManagement,
    layout: DashboardLayout,
  },
];

export default scheduleRoutes;
