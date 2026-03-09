import { PATHS } from "../utils/constants";
import ClassManagement from "../pages/Private/TrainingManagement/ClassManagement/ClassManagement";
import DashboardLayout from "../layouts/DashboardLayout";

export const classRoutes = [{ path: PATHS.TRAINING_CLASSES, component: ClassManagement, layout: DashboardLayout }];
