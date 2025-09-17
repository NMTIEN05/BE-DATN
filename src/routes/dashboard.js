import express from 'express';
import {
  getDashboardSummary,
  getMonthlyOrders,
} from '../controllers/dashboard.js';

const router = express.Router();

router.get('/summary', getDashboardSummary);
router.get('/monthly-orders', getMonthlyOrders);

export default router;
