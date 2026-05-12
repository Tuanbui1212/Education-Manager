import { Router } from 'express';
import { ScheduleRequestController } from '../controllers/scheduleRequest.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  initScheduleRequestSchema,
  updatePreferenceSchema,
  requestIdParamSchema,
} from '../validations/scheduleRequest.validation';

const router = Router();
const scheduleRequestController = new ScheduleRequestController();

router.post('/init', validate(initScheduleRequestSchema), scheduleRequestController.init);
router.patch('/update-pref', validate(updatePreferenceSchema), scheduleRequestController.updatePreference);
router.get('/:requestId', validate(requestIdParamSchema, 'params'), scheduleRequestController.getById);
router.delete('/:requestId', validate(requestIdParamSchema, 'params'), scheduleRequestController.cancelRequest);

export default router;
