import { PATHS } from '../utils/constants';

import DashboardLayout from '../layouts/DashboardLayout';
import ExpenditureManagement from '../pages/Private/ExpenditureManagement/ExpenditureManagement';
import CashbookDetail from '../pages/Private/FinanceManagement/CashbookManagement/CashbookDetail';

export const expenditureRoutes = [
  // { path: PATHS.SETTINGS_EXPENDITURES, component: ExpenditureManagement, layout: DashboardLayout },
  { path: PATHS.FINANCE_EXPENDITURES_ID, component: CashbookDetail, layout: DashboardLayout },
];
