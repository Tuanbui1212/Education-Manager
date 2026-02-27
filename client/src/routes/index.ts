import { authRoutes } from './auth.routes';
import { dashboardRoutes } from './dashboard.routes';
import { userRoutes } from './user.routes';

const publicRoutes = [...authRoutes];

const privateRoutes = [...dashboardRoutes, ...userRoutes];

export { publicRoutes, privateRoutes };
