import { Router } from 'express';
import {
  createFlashSale,
  getActiveFlashSales,
  getAllFlashSales,
  updateFlashSale,
  deleteFlashSale
} from '../controllers/flashSale.js';

import requireAuth from '../middlewares/auth.js'; // đảm bảo đã có middleware này

const router = Router();

// Công khai: user thấy flash sale đang hoạt động
router.get('/active', getActiveFlashSales);

// Admin: CRUD flash sale
router.use(requireAuth); // yêu cầu đăng nhập cho các route sau
router.get('/', getAllFlashSales);
router.post('/', createFlashSale);
router.put('/:id', updateFlashSale);
router.delete('/:id', deleteFlashSale);

export default router;
