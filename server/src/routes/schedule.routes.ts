import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  CreateScheduleSchema,
  GetSchedulesSchema,
  ScheduleIdSchema,
  UpdateScheduleSchema,
} from '../validations/schedule.validation';

const router = Router();
const scheduleController = new ScheduleController();

router.post('/', validate(CreateScheduleSchema), scheduleController.create);
router.get('', validate(GetSchedulesSchema, 'query'), scheduleController.getAll);
router.post('/bulk', scheduleController.createBulk);
router.delete('/bulk', scheduleController.deleteBulk);
router.get('/class/:classId/start-date', scheduleController.getStartDateClass);
router.get('/:id', validate(ScheduleIdSchema, 'params'), scheduleController.getOne);
router.put('/:id', validate(ScheduleIdSchema, 'params'), validate(UpdateScheduleSchema), scheduleController.update);
router.delete('/:id', validate(ScheduleIdSchema, 'params'), scheduleController.delete);

export default router;
