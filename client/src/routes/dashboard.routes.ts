import { PATHS } from "../utils/constants";

import HomePage from "../pages/HomePage";
import DashboardLayout from "../layouts/DashboardLayout";

export const dashboardRoutes = [
  { path: PATHS.HOME, component: HomePage, layout: DashboardLayout },
];
