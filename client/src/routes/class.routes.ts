import { PATHS } from '../utils/constants';
import ClassManagement from '../pages/Private/TrainingManagement/ClassManagement/ClassManagement';
import ClassDetail from '../pages/Private/TrainingManagement/ClassManagement/ClassDetail';
import CreateClassPage from '../pages/Private/TrainingManagement/ClassManagement/CreateClassPage';
import CreateClassSchedulePage from '../pages/Private/TrainingManagement/ClassManagement/CreateClassSchedulePage';
import DashboardLayout from '../layouts/DashboardLayout';


export const classRoutes = [
  { path: PATHS.TRAINING_CLASSES, component: ClassManagement, layout: DashboardLayout },
  { path: PATHS.TRAINING_CLASSES_CREATE, component: CreateClassPage, layout: DashboardLayout },
  { path: PATHS.TRAINING_CLASSES_ID, component: ClassDetail, layout: DashboardLayout },
  { path: PATHS.TRAINING_CLASSES_CREATE_SCHEDULE, component: CreateClassSchedulePage, layout: DashboardLayout },
];
