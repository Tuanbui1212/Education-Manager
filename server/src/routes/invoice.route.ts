import express from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createInvoiceSchema, updateInvoiceSchema, invoiceIdSchema } from '../validations/invoice.validation';
import { PERMISSIONS } from '../config/permissions.config';

const router = express.Router();
const invoiceController = new InvoiceController();

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.INVOICE.CREATE),
  validate(createInvoiceSchema),
  invoiceController.create,
);
router.get('/', verifyToken, requirePermission(PERMISSIONS.INVOICE.VIEW), invoiceController.getAll);
router.get(
  '/student/:studentId',
  verifyToken,
  requirePermission(PERMISSIONS.INVOICE.VIEW),
  invoiceController.getByStudentId,
);
router.get('/:id', verifyToken, requirePermission(PERMISSIONS.INVOICE.VIEW), invoiceController.getOne);
router.patch(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.INVOICE.EDIT),
  validate(updateInvoiceSchema),
  invoiceController.update,
);
// Dùng INVOICE.EDIT vì PERMISSIONS.INVOICE chưa có DELETE
router.delete(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.INVOICE.EDIT),
  validate(invoiceIdSchema),
  invoiceController.delete,
);
router.put(
  '/:id/installment',
  verifyToken,
  requirePermission(PERMISSIONS.INVOICE.EDIT),
  invoiceController.setupInstallment,
);
router.patch('/:id/notify', verifyToken, requirePermission(PERMISSIONS.INVOICE.EDIT), invoiceController.markAsNotified);

export default router;
