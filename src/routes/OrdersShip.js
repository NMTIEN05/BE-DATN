import express from "express";
import {
  getAllOrdersForShipper,
  updateOrderStatusByShipper,
} from "../controllers/OrdersShip.js";
import { authenticate, checkRole } from "../middlewares/auth.js";

const router = express.Router();

// ✅ Lấy danh sách đơn hàng - chỉ cho SHIPPER
router.get("/", authenticate, checkRole("shipper"), getAllOrdersForShipper);

// ✅ Cập nhật trạng thái đơn hàng - chỉ SHIPPER và chỉ cho phép "Đang giao", "Đã giao"
router.put("/:id/status", authenticate, checkRole("shipper"), updateOrderStatusByShipper);

export default router;
