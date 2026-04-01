import { PATHS } from '../utils/constants';

import CourseManagement from '../pages/Private/TrainingManagement/CourseManagement/CourseManagement';
import CourseDetail from '../pages/Private/TrainingManagement/CourseManagement/CourseDetail';
import DashboardLayout from '../layouts/DashboardLayout';

export const courseRoutes = [
  { path: PATHS.TRAINING_COURSES, component: CourseManagement, layout: DashboardLayout },
  { path: PATHS.TRAINING_COURSES_ID, component: CourseDetail, layout: DashboardLayout },
];
