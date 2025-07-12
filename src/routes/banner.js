import express from 'express';
import {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner
} from '../controllers/banner.js';

const router = express.Router();

router.post('/', createBanner);
router.get('/', getAllBanners);
router.get('/:id', getBannerById);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);

export default router;
