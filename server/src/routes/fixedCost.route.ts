import { Router } from 'express';
import { FixedCostController } from '../controllers/fixedCost.controller';
import { validate } from '../middlewares/validate.middleware';
import { createFixedCostSchema, updateFixedCostSchema } from '../validations/fixedCost.validation';

import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const fixedCostController = new FixedCostController();

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.FIXED_COST.CREATE),
  validate(createFixedCostSchema),
  fixedCostController.create,
);
router.get('/', verifyToken, requirePermission(PERMISSIONS.FIXED_COST.VIEW), fixedCostController.getAll);
router.get('/:id', verifyToken, requirePermission(PERMISSIONS.FIXED_COST.VIEW), fixedCostController.getById);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.FIXED_COST.EDIT),
  validate(updateFixedCostSchema),
  fixedCostController.update,
);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.FIXED_COST.DELETE), fixedCostController.remove);

export default router;
