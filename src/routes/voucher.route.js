import express from "express";
import {
  createVoucher,
  getAllVouchers,
  deleteVoucher,
  applyVoucher,
  editVoucher,
  getVoucherById
} from "../controllers/voucher.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Admin
router.post("/", authenticate, createVoucher);

router.put("/:id", authenticate, requireAdmin, editVoucher);
router.get("/", authenticate, getAllVouchers);
router.get("/:id", authenticate,getVoucherById );
router.delete("/:id", authenticate, requireAdmin, deleteVoucher);


// Public
router.post("/apply", applyVoucher); // người dùng dùng mã giảm giá

export default router;