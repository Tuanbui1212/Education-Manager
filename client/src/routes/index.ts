import { authRoutes } from './auth.routes';
import { dashboardRoutes } from './dashboard.routes';
import { userRoutes } from './user.routes';
import { shiftRoutes } from './shift.routes';
import { expenditureRoutes } from './expenditure.routes';
import { roomRoutes } from './room.routes';

const publicRoutes = [...authRoutes];

const privateRoutes = [...dashboardRoutes, ...userRoutes, ...shiftRoutes, ...expenditureRoutes, ...roomRoutes];

export { publicRoutes, privateRoutes };
