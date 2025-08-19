import express from "express";
import { createFlashSale, getAllFlashSales } from "../controllers/flashSale.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Admin tạo flash sale
router.post("/", authenticate, requireAdmin, createFlashSale);

// Lấy tất cả flash sale
router.get("/", getAllFlashSales);

export default router;
