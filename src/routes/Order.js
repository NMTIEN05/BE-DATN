import express from "express";
import {
  createOrder,
  getOrdersByUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  updateShippingInfo,
  cancelOrderByCustomer
} from "../controllers/Order.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireAdmin } from "../middlewares/auth.js";
import {authenticate}  from "../middlewares/auth.js";

const router = express.Router();

router.use(requireAuth);

// Tạo đơn hàng
router.post("",authenticate, createOrder);

// Người dùng lấy danh sách đơn hàng của mình
router.get("/my-orders", getOrdersByUser);

// Admin lấy tất cả đơn hàng
router.get("/", getAllOrders);

// Chi tiết 1 đơn hàng
router.get("/:id", getOrderById);
// Admin cập nhật trạng thái đơn hàng
router.put("/:id/status", requireAdmin, updateOrderStatus);
// Admin xoá đơn hàng
router.delete("/:id", requireAdmin, deleteOrder);
router.put("/:id/shipping-info", updateShippingInfo);
router.put('/:id/cancel', cancelOrderByCustomer);




export default router;
