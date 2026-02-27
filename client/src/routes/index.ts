import { authRoutes } from './auth.routes';
import { dashboardRoutes } from './dashboard.routes';
import { userRoutes } from './user.routes';
import { shiftRoutes } from './shift.routes';
import { expenditureRoutes } from './expenditure.routes';

const publicRoutes = [...authRoutes];

const privateRoutes = [...dashboardRoutes, ...userRoutes, ...shiftRoutes, ...expenditureRoutes];

export { publicRoutes, privateRoutes };
