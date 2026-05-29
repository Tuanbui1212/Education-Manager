import { PATHS } from '../utils/constants';

import DashboardLayout from '../layouts/DashboardLayout';
import FixedCostManagement from '../pages/Private/Configuration/FixedCostManagement/FixedCostManagement';

export const fixedCostRoutes = [
  { path: PATHS.SETTINGS_FIXED_COSTS, component: FixedCostManagement, layout: DashboardLayout },
];
