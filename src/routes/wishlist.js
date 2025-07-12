import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.js';
import requireAuth from '../middlewares/auth.js';      // middleware verify JWT

const router = Router();

router.use(requireAuth);              // tất cả endpoint cần đăng nhập
router.get('/',            getWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
