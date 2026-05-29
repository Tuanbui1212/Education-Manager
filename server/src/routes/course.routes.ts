import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateCourseSchema, CourseIdSchema, UpdateCourseSchema } from '../validations/course.validation';

import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const courseController = new CourseController();

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.COURSE.CREATE),
  validate(CreateCourseSchema),
  courseController.create,
);
router.get('/', verifyToken, requirePermission(PERMISSIONS.COURSE.VIEW, PERMISSIONS.CLASS.CREATE), courseController.getAll);
router.get(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.COURSE.VIEW),
  validate(CourseIdSchema, 'params'),
  courseController.getOne,
);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.COURSE.EDIT),
  validate(CourseIdSchema, 'params'),
  validate(UpdateCourseSchema),
  courseController.update,
);
router.delete(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.COURSE.DELETE),
  validate(CourseIdSchema, 'params'),
  courseController.delete,
);

export default router;
