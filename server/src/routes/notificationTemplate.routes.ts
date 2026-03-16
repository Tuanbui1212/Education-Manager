import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import {
  CreateNotificationTemplateSchema,
  UpdateNotificationTemplateSchema,
  NotificationTemplateIdSchema,
} from '../validations/notificationTemplate.validation';
import { NotificationTemplateController } from '../controllers/notificationTemplate.controller';

import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const notificationTemplateController = new NotificationTemplateController();

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.NOTIFICATION_TEMPLATE.CREATE),
  validate(CreateNotificationTemplateSchema),
  notificationTemplateController.create,
);
router.get(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.NOTIFICATION_TEMPLATE.VIEW),
  notificationTemplateController.getAll,
);

router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.NOTIFICATION_TEMPLATE.EDIT),
  validate(NotificationTemplateIdSchema, 'params'),
  validate(UpdateNotificationTemplateSchema),
  notificationTemplateController.update,
);
router.get(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.NOTIFICATION_TEMPLATE.VIEW),
  validate(NotificationTemplateIdSchema, 'params'),
  notificationTemplateController.getOne,
);
router.delete(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.NOTIFICATION_TEMPLATE.DELETE),
  validate(NotificationTemplateIdSchema, 'params'),
  notificationTemplateController.delete,
);

export default router;
