import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { CreateNotificationTemplateSchema, UpdateNotificationTemplateSchema, NotificationTemplateIdSchema } from '../validations/notificationTemplate.validation';
import { NotificationTemplateController } from '../controllers/notificationTemplate.controller';

const router = Router();
const notificationTemplateController = new NotificationTemplateController();

router.post('/', validate(CreateNotificationTemplateSchema), notificationTemplateController.create);
router.get('/', notificationTemplateController.getAll);

router.put('/:id', validate(NotificationTemplateIdSchema, "params"), validate(UpdateNotificationTemplateSchema), notificationTemplateController.update);
router.get('/:id', validate(NotificationTemplateIdSchema, "params"), notificationTemplateController.getOne);
router.delete('/:id', validate(NotificationTemplateIdSchema, "params"), notificationTemplateController.delete);

export default router;
