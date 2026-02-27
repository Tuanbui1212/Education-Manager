import { PATHS } from '../utils/constants';

import ShiftManagement from '../pages/Private/ShiftManagement/ShiftManagement';
import DashboardLayout from '../layouts/DashboardLayout';

export const shiftRoutes = [{ path: PATHS.SETTINGS_SHIFTS, component: ShiftManagement, layout: DashboardLayout }];
