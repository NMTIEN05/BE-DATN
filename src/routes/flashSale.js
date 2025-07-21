import { Router } from 'express';
import {
  createFlashSale,
  getActiveFlashSales,
  getAllFlashSales,
  updateFlashSale,
  deleteFlashSale,
  getFlashSaleById
} from '../controllers/flashSale.js'; // ✅ đảm bảo tên file là "flashSale.js"

import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Công khai: người dùng thấy flash sale đang hoạt động
router.get('/active', getActiveFlashSales);

// Admin: yêu cầu đăng nhập
router.use(authenticate); // Tất cả các route dưới đây sẽ yêu cầu xác thực
router.get('/', requireAdmin, getAllFlashSales);
router.get('/:id', requireAdmin, getFlashSaleById);
router.post('/', requireAdmin, createFlashSale);
router.put('/:id', requireAdmin, updateFlashSale);
router.delete('/:id', requireAdmin, deleteFlashSale);

export default router;
