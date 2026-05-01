import express from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTransaction } from '../validations/transaction.validation';

const router = express.Router();
const transactionController = new TransactionController();

router.post('/', verifyToken, transactionController.createTransaction);
router.get('/', verifyToken, transactionController.getTransactions);
router.post('/create', verifyToken, validate(createTransaction), transactionController.createTransactionTest);
router.get('/:id', verifyToken, transactionController.getTransactionById);

export default router;
