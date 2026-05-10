import { PATHS } from '../utils/constants';

import DashboardLayout from '../layouts/DashboardLayout';
import TransactionList from '../pages/Private/TransactionManagement/TransactionList';
import CashbookManagement from '../pages/Private/FinanceManagement/CashbookManagement/CashbookManagement';
import CashbookDetail from '../pages/Private/FinanceManagement/CashbookManagement/CashbookDetail';

export const transactionRoutes = [
  //{ path: PATHS.FINANCE_TRANSACTIONS, component: TransactionList, layout: DashboardLayout },
  { path: PATHS.FINANCE_TRANSACTIONS, component: CashbookManagement, layout: DashboardLayout },
  { path: PATHS.FINANCE_TRANSACTIONS_ID, component: CashbookDetail, layout: DashboardLayout },
];
