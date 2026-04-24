import { PATHS } from '../utils/constants';
import DashboardLayout from '../layouts/DashboardLayout';
import FinancialReport from '../pages/Private/FinanceManagement/ReportFinanceManagement/FinancialReport';

export const reportRoutes = [{ path: PATHS.FINANCE_REPORT, component: FinancialReport, layout: DashboardLayout }];
