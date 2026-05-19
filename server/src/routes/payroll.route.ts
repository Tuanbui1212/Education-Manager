import { Router } from 'express';
import payrollController from '../controllers/payroll.controller';
import { validate } from '../middlewares/validate.middleware';
import { createPayrollSchema, updatePayrollSchema } from '../validations/payroll.validation';
import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.PAYROL.CREATE),
  validate(createPayrollSchema),
  payrollController.create,
);
router.get('/', verifyToken, requirePermission(PERMISSIONS.PAYROL.VIEW), payrollController.getAll);
router.post('/generate', verifyToken, requirePermission(PERMISSIONS.PAYROL.CREATE), payrollController.generateForMonth);
router.post(
  '/generatePayrollForUsers',
  verifyToken,
  requirePermission(PERMISSIONS.PAYROL.CREATE),
  payrollController.generatePayrollForUsers,
);
router.post('/send-email', verifyToken, requirePermission(PERMISSIONS.PAYROL.EDIT), payrollController.sendPayrollEmail);
router.post('/mark-paid', verifyToken, requirePermission(PERMISSIONS.PAYROL.EDIT), payrollController.markAsPaid);
router.get('/export', verifyToken, requirePermission(PERMISSIONS.PAYROL.VIEW), payrollController.exportExcel);
router.get('/:id', verifyToken, requirePermission(PERMISSIONS.PAYROL.VIEW), payrollController.getById);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.PAYROL.EDIT),
  validate(updatePayrollSchema),
  payrollController.update,
);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.PAYROL.DELETE), payrollController.delete);

export default router;
