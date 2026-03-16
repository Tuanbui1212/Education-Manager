import { Router } from 'express';
import { ExpenditureController } from '../controllers/expenditure.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateExpenditureSchema, UpdateExpenditureSchema } from '../validations/expenditure.validation';

import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const expenditureController = new ExpenditureController();

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.EXPENDITURE.CREATE),
  validate(CreateExpenditureSchema),
  expenditureController.create,
);
router.get('/', verifyToken, requirePermission(PERMISSIONS.EXPENDITURE.VIEW), expenditureController.getAll);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.EXPENDITURE.EDIT),
  validate(UpdateExpenditureSchema),
  expenditureController.update,
);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.EXPENDITURE.DELETE), expenditureController.delete);

export default router;
