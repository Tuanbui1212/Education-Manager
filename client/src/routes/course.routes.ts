import { PATHS } from '../utils/constants';

import CourseManagement from '../pages/Private/TrainingManagement/CourseManagement/CourseManagement';
import DashboardLayout from '../layouts/DashboardLayout';

export const courseRoutes = [{ path: PATHS.TRAINING_COURSES, component: CourseManagement, layout: DashboardLayout }];