import { authRoutes } from './auth.routes';
import { dashboardRoutes } from './dashboard.routes';

const publicRoutes = [...authRoutes];

const privateRoutes = [...dashboardRoutes];

export { publicRoutes, privateRoutes };
