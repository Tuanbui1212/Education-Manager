import { Router } from 'express';
import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { CashBookController } from '../controllers/cashbook.controller';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const cashBookController = new CashBookController();

router.get('/', verifyToken, requirePermission(PERMISSIONS.CASHBOOK.VIEW), cashBookController.getCashBook);
router.get(
  '/summary',
  verifyToken,
  requirePermission(PERMISSIONS.CASHBOOK.VIEW),
  cashBookController.getCashBookYearlySummary,
);
router.get('/:id', verifyToken, requirePermission(PERMISSIONS.CASHBOOK.VIEW), cashBookController.getCashBookById);

export default router;
