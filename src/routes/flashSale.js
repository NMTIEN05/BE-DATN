import express from 'express';
import {
  createFlashSale,
  getAllFlashSales,
  getFlashSaleById,
  updateFlashSale,
  deleteFlashSale
} from '../controllers/flashSale.js';

const router = express.Router();

router.post('/add', createFlashSale);
// router.get('/', getAllFlashSales);
// router.get('/:id', getFlashSaleById);
// router.put('/:id', updateFlashSale);
// router.delete('/:id', deleteFlashSale);

export default router;
