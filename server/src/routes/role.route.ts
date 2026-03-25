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
router.get('/', verifyToken, requirePermission(PERMISSIONS.ROLE.VIEW), roleController.getAll);
router.get('/:id', verifyToken, requirePermission(PERMISSIONS.ROLE.VIEW), roleController.getById);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.ROLE.EDIT),
  validate(updateRoleSchema),
  roleController.update,
);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.ROLE.DELETE), roleController.remove);

export default router;
