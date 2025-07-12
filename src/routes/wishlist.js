import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.js';
import { authenticate } from '../middlewares/auth.js'; // ✅ Sửa ở đây

const router = Router();

router.use(authenticate); // ✅ Sửa ở đây

router.get('/', getWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
