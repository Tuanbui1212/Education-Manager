import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { CashBookController } from '../controllers/cashbook.controller';

const router = Router();
const cashBookController = new CashBookController();

router.get('/', verifyToken, cashBookController.getCashBook);
router.get('/summary', verifyToken, cashBookController.getCashBookYearlySummary);
router.get('/:id', verifyToken, cashBookController.getCashBookById);

export default router;
