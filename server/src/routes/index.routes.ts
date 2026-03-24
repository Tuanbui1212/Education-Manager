import { Application } from 'express-serve-static-core';
import userRouter from './user.routes';
import roomRouter from './room.routes';
import authRouter from './auth.routes';
import shiftRouter from './shift.routes';
import expenditureRouter from './expenditure.routes';
import notificationTemplateRouter from './notificationTemplate.routes';
import courseRouter from './course.routes';
import classRouter from './class.routes';
import fixedCostRouter from './fixedCost.route';
import roleRouter from './role.route';
import scheduleRouter from './schedule.routes';
import attendanceRouter from './attendance.routes';
import invoiceRouter from './invoice.route';
import transactionRoute from './transaction.route';

function router(app: Application) {
  app.use('/api/users', userRouter);
  app.use('/api/roles', roleRouter);
  app.use('/api/rooms', roomRouter);
  app.use('/api/login', authRouter);
  app.use('/api/shifts', shiftRouter);
  app.use('/api/expenditures', expenditureRouter);
  app.use('/api/notification-templates', notificationTemplateRouter);
  app.use('/api/courses', courseRouter);
  app.use('/api/classes', classRouter);
  app.use('/api/fixed-costs', fixedCostRouter);
  app.use('/api/schedules', scheduleRouter);
  app.use('/api/attendances', attendanceRouter);
  app.use('/api/invoices', invoiceRouter);
  app.use('/api/transactions', transactionRoute);
}

export default router;
