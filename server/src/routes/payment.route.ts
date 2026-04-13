import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const paymentController = new PaymentController();

router.post('/create-url', paymentController.createUrl);
router.get('/vnpay-ipn', paymentController.vnpayIpn);

export default router;
