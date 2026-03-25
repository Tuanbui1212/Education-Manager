import { PATHS } from '../utils/constants';
import ClassManagement from '../pages/Private/TrainingManagement/ClassManagement/ClassManagement';
import ClassDetail from '../pages/Private/TrainingManagement/ClassManagement/ClassDetail';
import DashboardLayout from '../layouts/DashboardLayout';

export const classRoutes = [
  { path: PATHS.TRAINING_CLASSES, component: ClassManagement, layout: DashboardLayout },
  { path: PATHS.TRAINING_CLASSES_ID, component: ClassDetail, layout: DashboardLayout },
];
