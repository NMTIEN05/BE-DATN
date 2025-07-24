import express from 'express';
import {
  getAllSubBanners,
  createSubBanner,
  updateSubBanner,
  deleteSubBanner
} from '../controllers/subbanner.controller.js';

const router = express.Router();

router.get('/', getAllSubBanners);
router.post('/', createSubBanner);
router.put('/:id', updateSubBanner);
router.delete('/:id', deleteSubBanner);

export default router;
