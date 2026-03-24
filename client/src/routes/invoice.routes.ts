import { PATHS } from '../utils/constants';
import InvoiceManagement from '../pages/Private/InvoiceManagement/InvoiceManagement';
import DashboardLayout from '../layouts/DashboardLayout';

export const invoiceRoutes = [{ path: PATHS.FINANCE_INVOICES, component: InvoiceManagement, layout: DashboardLayout }];
