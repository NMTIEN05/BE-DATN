import express from "express";
import {
  createOrder,
  getOrdersByUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  updateShippingInfo,
  cancelOrderByCustomer,
  requestReturn,
  markRefunded,
  markReturned,
  updateReturnStatus,
  confirmReceived,
  assignShipperToOrder,
  getOrdersByShipper

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
router.get("/shipper", authenticate, getOrdersByShipper);
// Chi tiết 1 đơn hàng
router.get("/:id", getOrderById);
// Admin cập nhật trạng thái đơn hàng
router.put("/:id/status", updateOrderStatus);
// Admin xoá đơn hàng
router.delete("/:id", requireAdmin, deleteOrder);
router.put("/:id/shipping-info", updateShippingInfo);
router.put('/:id/cancel', cancelOrderByCustomer);


router.post('/:orderId/return-request', requestReturn); // khách gửi yêu cầu
router.patch('/:orderId/return-request', updateReturnStatus); // admin duyệt/từ chối
router.put('/:orderId/return-request/returned', markReturned); // admin xác nhận đã nhận lại hàng
router.put('/:orderId/return-request/refund', markRefunded); // admin hoàn tiền

router.patch("/:id/confirm-received",confirmReceived);

router.put("/:id/assign-shipper", assignShipperToOrder);






export default router;
