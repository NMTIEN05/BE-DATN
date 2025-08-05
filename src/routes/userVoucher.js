import express from 'express';
import { claimVoucher, getMyVouchers } from '../controllers/UseVoucher.js';
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post('/', authenticate, claimVoucher);
router.get('/my', authenticate, getMyVouchers);




export default router;



