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
import scheduleRequestRouter from './scheduleRequest.routes';
import attendanceRouter from './attendance.routes';
import invoiceRouter from './invoice.route';
import transactionRoute from './transaction.route';
import attendanceNotificationRouter from './attendanceNotification.routes';
import payrollRouter from './payroll.route';
import paymentRouter from './payment.route';
import examRouter from './exam.routes';
import cashbookRouter from './cashbook.route';
import classRequestRouter from './classRequest.routes';

function router(app: Application) {
  app.get('/', (req, res) => res.send('Server is running!'));
  app.use('/api/users', userRouter);
  app.use('/api/roles', roleRouter);
  app.use('/api/rooms', roomRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/shifts', shiftRouter);
  app.use('/api/expenditures', expenditureRouter);
  app.use('/api/notification-templates', notificationTemplateRouter);
  app.use('/api/courses', courseRouter);
  app.use('/api/classes', classRouter);
  app.use('/api/classRequests', classRequestRouter);
  app.use('/api/fixed-costs', fixedCostRouter);
  app.use('/api/schedules', scheduleRouter);
  app.use('/api/scheduleRequests', scheduleRequestRouter);
  app.use('/api/attendances', attendanceRouter);
  app.use('/api/invoices', invoiceRouter);
  app.use('/api/transactions', transactionRoute);
  app.use('/api/attendance-notifications', attendanceNotificationRouter);
  app.use('/api/payrolls', payrollRouter);
  app.use('/api/payments', paymentRouter);
  app.use('/api/exams', examRouter);
  app.use('/api/cashbook', cashbookRouter);
}

export default router;
