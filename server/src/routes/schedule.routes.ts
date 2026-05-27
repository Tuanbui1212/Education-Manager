import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  CreateScheduleSchema,
  GetSchedulesSchema,
  ScheduleIdSchema,
  UpdateScheduleSchema,
} from '../validations/schedule.validation';
import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const scheduleController = new ScheduleController();

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.SCHEDULE.CREATE),
  validate(CreateScheduleSchema),
  scheduleController.create,
);
router.get(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.SCHEDULE.VIEW),
  validate(GetSchedulesSchema, 'query'),
  scheduleController.getAll,
);
router.post('/bulk', verifyToken, requirePermission(PERMISSIONS.SCHEDULE.CREATE), scheduleController.createBulk);
router.delete('/bulk', verifyToken, requirePermission(PERMISSIONS.SCHEDULE.DELETE), scheduleController.deleteBulk);
router.get(
  '/class/today',
  verifyToken,
  requirePermission(PERMISSIONS.SCHEDULE.VIEW),
  scheduleController.getTodaySchedules,
);
router.get(
  '/class/:classId/start-date',
  verifyToken,
  requirePermission(PERMISSIONS.SCHEDULE.VIEW),
  scheduleController.getStartDateClass,
);
router.post(
  '/class/createScheduleForAllClassRequest',
  verifyToken,
  requirePermission(PERMISSIONS.SCHEDULE.CREATE),
  scheduleController.createScheduleForAllClassRequest,
);
router.get(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.SCHEDULE.VIEW),
  validate(ScheduleIdSchema, 'params'),
  scheduleController.getOne,
);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.SCHEDULE.EDIT),
  validate(ScheduleIdSchema, 'params'),
  validate(UpdateScheduleSchema),
  scheduleController.update,
);
router.delete(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.SCHEDULE.DELETE),
  validate(ScheduleIdSchema, 'params'),
  scheduleController.delete,
);

export default router;
