import { Router } from 'express';
import payrollController from '../controllers/payroll.controller';
import { validate } from '../middlewares/validate.middleware';
import { createPayrollSchema, updatePayrollSchema } from '../validations/payroll.validation';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', verifyToken, validate(createPayrollSchema), payrollController.create);
router.get('/', verifyToken, payrollController.getAll);
router.post('/generate', verifyToken, payrollController.generateForMonth);
router.post('/generatePayrollForUsers', verifyToken, payrollController.generatePayrollForUsers);
router.post('/send-email', verifyToken, payrollController.sendPayrollEmail);
router.post('/mark-paid', verifyToken, payrollController.markAsPaid);
router.get('/export', verifyToken, payrollController.exportExcel);
router.get('/:id', verifyToken, payrollController.getById);
router.put('/:id', verifyToken, validate(updatePayrollSchema), payrollController.update);
router.delete('/:id', verifyToken, payrollController.delete);

export default router;
