import express from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { validate } from '../middlewares/validate.middleware';
import { createInvoiceSchema, updateInvoiceSchema, invoiceIdSchema } from '../validations/invoice.validation';

const router = express.Router();
const invoiceController = new InvoiceController();

router.post('/', validate(createInvoiceSchema), invoiceController.create);
router.get('/', invoiceController.getAll);
router.get('/:id', validate(invoiceIdSchema), invoiceController.getOne);
router.patch('/:id', validate(updateInvoiceSchema), invoiceController.update);
router.delete('/:id', validate(invoiceIdSchema), invoiceController.delete);
router.put('/:id/installment', invoiceController.setupInstallment);

export default router;
