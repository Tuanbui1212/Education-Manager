import { Router } from 'express';
import { ShiftController } from '../controllers/shift.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateShiftSchema, UpdateShiftSchema } from '../validations/shift.validation';

import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const shiftController = new ShiftController();

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.SHIFT.CREATE),
  validate(CreateShiftSchema),
  shiftController.create,
);
router.get('/', verifyToken, requirePermission(PERMISSIONS.SHIFT.VIEW), shiftController.getAll);

router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.SHIFT.EDIT),
  validate(UpdateShiftSchema),
  shiftController.update,
);
router.get('/:id', verifyToken, requirePermission(PERMISSIONS.SHIFT.VIEW), shiftController.getOne);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.SHIFT.DELETE), shiftController.delete);

export default router;
