import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { validate } from '../middlewares/validate.middleware';
import { createRoleSchema, updateRoleSchema } from '../validations/role.validation';

import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const roleController = new RoleController();

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.ROLE.CREATE),
  validate(createRoleSchema),
  roleController.create,
);
router.get('/', verifyToken, requirePermission(PERMISSIONS.ROLE.VIEW, PERMISSIONS.USER.CREATE, PERMISSIONS.USER.EDIT,
  PERMISSIONS.TEACHER.CREATE, PERMISSIONS.TEACHER.EDIT,
  PERMISSIONS.STAFF.CREATE, PERMISSIONS.STAFF.EDIT,
  PERMISSIONS.STUDENT.CREATE, PERMISSIONS.STUDENT.EDIT,
  PERMISSIONS.CLASS.CREATE, PERMISSIONS.CLASS.EDIT,
), roleController.getAll);
router.get('/:id', verifyToken, requirePermission(PERMISSIONS.ROLE.VIEW, PERMISSIONS.USER.CREATE, PERMISSIONS.USER.EDIT,
  PERMISSIONS.TEACHER.CREATE, PERMISSIONS.TEACHER.EDIT,
  PERMISSIONS.STAFF.CREATE, PERMISSIONS.STAFF.EDIT,
  PERMISSIONS.STUDENT.CREATE, PERMISSIONS.STUDENT.EDIT,
), roleController.getById);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.ROLE.EDIT),
  validate(updateRoleSchema),
  roleController.update,
);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.ROLE.DELETE), roleController.remove);

export default router;
