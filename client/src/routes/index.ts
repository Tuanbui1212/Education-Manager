import { authRoutes } from './auth.routes';
import { dashboardRoutes } from './dashboard.routes';
import { userRoutes } from './user.routes';
import { shiftRoutes } from './shift.routes';
import { expenditureRoutes } from './expenditure.routes';
import { roomRoutes } from './room.routes';
import { notificationTemplateRoutes } from './notificationTemplate.routes';
import { fixedCostRoutes } from './fixedCost.routes';
import { roleRoutes } from './role.routes';
import { courseRoutes } from './course.routes';
import { classRoutes } from './class.routes';

const publicRoutes = [...authRoutes];

const privateRoutes = [
  ...dashboardRoutes,
  ...userRoutes,
  ...shiftRoutes,
  ...expenditureRoutes,
  ...roomRoutes,
  ...notificationTemplateRoutes,
  ...fixedCostRoutes,
  ...roleRoutes,
  ...courseRoutes,
  ...classRoutes,
];

export { publicRoutes, privateRoutes };
