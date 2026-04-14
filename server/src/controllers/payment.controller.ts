import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

const paymentService = new PaymentService();

export class PaymentController {
  // [POST] /api/payments/create-url
  createUrl = async (req: Request, res: Response) => {
    try {
      const { invoiceId, bankCode } = req.body;
      const forwarded = req.headers['x-forwarded-for'];
      const ipAddr =
        (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) || req.socket.remoteAddress || '127.0.0.1';

      const paymentUrl = await paymentService.generateVnpayUrl(invoiceId, String(ipAddr), bankCode);

      return res.status(200).json({
        success: true,
        data: { paymentUrl },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  // [GET] /api/payments/vnpay-ipn
  vnpayIpn = async (req: Request, res: Response) => {
    try {
      const result = await paymentService.handleVnpayIpn(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
  };
}
