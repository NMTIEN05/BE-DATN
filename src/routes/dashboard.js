import express from 'express';
import {
  getDashboardSummary,
  getMonthlyOrders,
  getBestSellers,
  getFewStock,
  getLowStock,
  getHardToSell
} from '../controllers/dashboard.js';

const router = express.Router();


// Tổng quan
router.get('/summary', getDashboardSummary);

// Biểu đồ đơn hàng
router.get('/monthly-orders', getMonthlyOrders);

// Sản phẩm
router.get('/best-sellers', getBestSellers);
router.get('/low-stock', getLowStock);
router.get('/few-stock', getFewStock);
router.get('/hard-to-sell', getHardToSell);

export default router;
