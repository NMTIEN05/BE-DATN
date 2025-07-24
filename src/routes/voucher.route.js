import express from "express";
import {
  createVoucher,
  getAllVouchers,
  deleteVoucher,
  applyVoucher,
} from "../controllers/voucher.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Admin
router.post("/", authenticate, requireAdmin, createVoucher);
router.get("/", authenticate, requireAdmin, getAllVouchers);
router.delete("/:id", authenticate, requireAdmin, deleteVoucher);

// Public
router.post("/apply", applyVoucher); // người dùng dùng mã giảm giá

export default router;