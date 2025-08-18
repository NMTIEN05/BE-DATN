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
<<<<<<< HEAD
router.put("/:id", authenticate, requireAdmin, editVoucher);
router.get("/", authenticate, getAllVouchers);
router.get("/:id", authenticate,getVoucherById );
router.delete("/:id", authenticate, requireAdmin, deleteVoucher);
=======
router.put("/:id", authenticate, editVoucher);
router.get("/", authenticate, getAllVouchers);
router.get("/:id", authenticate,getVoucherById );
router.delete("/:id", authenticate, deleteVoucher);
>>>>>>> d1402b64f62aa83adf291359db0ddeabff2c349c


// Public
router.post("/apply", applyVoucher); // người dùng dùng mã giảm giá

export default router;