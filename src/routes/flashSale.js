import { Router } from 'express';
import {
  createFlashSale,
  getActiveFlashSales,
  getAllFlashSales,
  updateFlashSale,
  deleteFlashSale
} from '../controllers/flashSale.js';

// SỬA LẠI: import đúng middleware theo named export
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Công khai: user thấy flash sale đang hoạt động
router.get('/active', getActiveFlashSales);

// Admin: CRUD flash sale
// router.use(authenticate); // yêu cầu đăng nhập cho các route sau
router.get('/', getAllFlashSales);
router.post('/', createFlashSale);
router.put('/:id', updateFlashSale);
router.delete('/:id', deleteFlashSale);

export default router;
