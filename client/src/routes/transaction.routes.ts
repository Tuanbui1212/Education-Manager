import { PATHS } from '../utils/constants';

import DashboardLayout from '../layouts/DashboardLayout';
import TransactionList from '../pages/Private/TransactionManagement/TransactionList';

export const transactionRoutes = [
  { path: PATHS.FINANCE_TRANSACTIONS, component: TransactionList, layout: DashboardLayout },
];
