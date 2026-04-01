import { PATHS } from '../utils/constants';
import DashboardLayout from '../layouts/DashboardLayout';
import PayrollManager from '../pages/Private/HRManagement/PayrollManager/PayrollManager';

export const payrollRoutes = [{ path: PATHS.HR_PAYROLL, component: PayrollManager, layout: DashboardLayout }];
