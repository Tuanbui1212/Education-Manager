import { PATHS } from '../utils/constants';
import DashboardLayout from '../layouts/DashboardLayout';
import ContractManager from '../pages/Private/HRManagement/ContactManager/ContractManager';

export const contactRoutes = [{ path: PATHS.HR_CONTRACTS, component: ContractManager, layout: DashboardLayout }];
