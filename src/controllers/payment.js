import { createPaymentUrl, handleVnpayReturn, handleVnpayIPN } from '../service/vnpay.js';

export const createPayment = (req, res) => {
  return createPaymentUrl(req, res);
};

export const checkVnpayReturn = (req, res) => {
  return handleVnpayReturn(req, res);
};

export const vnpayIPN = (req, res) => {
  return handleVnpayIPN(req, res);
};
