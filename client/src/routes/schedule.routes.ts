import { lazy } from 'react';
import { PATHS } from '../utils/constants';
import DashboardLayout from '../layouts/DashboardLayout';

const ScheduleManagement = lazy(
  () => import('../pages/Private/TrainingManagement/ScheduleManagement/ScheduleManagement'),
);

import AutoSchedule from '../pages/Private/TrainingManagement/AutoSchedule/AutoSchedule';

const scheduleRoutes = [
  {
    path: PATHS.TRAINING_SCHEDULES,
    component: ScheduleManagement,
    layout: DashboardLayout,
  },
  {
    path: PATHS.TRAINING_AUTO_SCHEDULES,
    component: AutoSchedule,
    layout: DashboardLayout,
  },
];

export default scheduleRoutes;
