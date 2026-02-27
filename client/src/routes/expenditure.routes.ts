import { PATHS } from '../utils/constants';

import DashboardLayout from '../layouts/DashboardLayout';
import ExpenditureManagement from '../pages/Private/ExpenditureManagement/ExpenditureManagement';

export const expenditureRoutes = [
  { path: PATHS.SETTINGS_EXPENDITURES, component: ExpenditureManagement, layout: DashboardLayout },
];
