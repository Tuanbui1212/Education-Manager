import express from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();
const transactionController = new TransactionController();

router.post('/', verifyToken, transactionController.createTransaction);
router.get('/', verifyToken, transactionController.getTransactions);

export default router;
