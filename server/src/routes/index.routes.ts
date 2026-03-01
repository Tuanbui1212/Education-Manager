import { Application } from 'express-serve-static-core';
import userRouter from './user.routes';
import roomRouter from './room.routes';
import authRouter from './auth.routes';
import shiftRouter from './shift.routes';
import expenditureRouter from './expenditure.routes';
import notificationTemplateRouter from './notificationTemplate.routes';

function router(app: Application) {
  app.use('/api/users', userRouter);
  app.use('/api/rooms', roomRouter);
  app.use('/api/login', authRouter);
  app.use('/api/shifts', shiftRouter);
  app.use('/api/expenditures', expenditureRouter);
  app.use('/api/notification-templates', notificationTemplateRouter);
}

export default router;
