import { Router } from 'express';
import payrollController from '../controllers/payroll.controller';
import { validate } from '../middlewares/validate.middleware';
import { createPayrollSchema, updatePayrollSchema } from '../validations/payroll.validation';

const router = Router();

router.post('/', validate(createPayrollSchema), payrollController.create);
router.get('/', payrollController.getAll);
router.post('/generate', payrollController.generateForMonth);
router.post('/send-email', payrollController.sendPayrollEmail);
router.post('/mark-paid', payrollController.markAsPaid);
router.get('/export', payrollController.exportExcel);
router.get('/:id', payrollController.getById);
router.put('/:id', validate(updatePayrollSchema), payrollController.update);
router.delete('/:id', payrollController.delete);

export default router;
