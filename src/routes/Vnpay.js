import { Router } from 'express';
import {
  createPayment,
  checkVnpayReturn,
  vnpayIPN,
} from '../controllers/payment.js';

const paymentRouter = Router();

paymentRouter.get('/create_payment', createPayment);
paymentRouter.get('/check_payment', checkVnpayReturn);
paymentRouter.get('/vnpay_ipn', vnpayIPN);

export default paymentRouter;
