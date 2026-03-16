import { Router } from 'express';
import { ClassController } from '../controllers/class.controller';
import { validate } from '../middlewares/validate.middleware';
import { ClassIdSchema, CreateClassSchema, UpdateClassSchema } from '../validations/class.validation';

import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const classController = new ClassController();

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.CLASS.CREATE),
  validate(CreateClassSchema),
  classController.create,
);
router.get('/', verifyToken, requirePermission(PERMISSIONS.CLASS.VIEW), classController.getAll);
router.get('/student/:id', verifyToken, requirePermission(PERMISSIONS.CLASS.VIEW), classController.getClassByStudentId);
router.get(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.CLASS.VIEW),
  validate(ClassIdSchema, 'params'),
  classController.getOne,
);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.CLASS.EDIT),
  validate(ClassIdSchema, 'params'),
  validate(UpdateClassSchema),
  classController.update,
);
router.delete(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.CLASS.DELETE),
  validate(ClassIdSchema, 'params'),
  classController.delete,
);
router.get(
  '/:id/students',
  verifyToken,
  requirePermission(PERMISSIONS.CLASS.VIEW),
  validate(ClassIdSchema, 'params'),
  classController.getAllStudents,
);

export default router;
