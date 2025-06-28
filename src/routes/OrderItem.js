import express from "express";
import {
  getAllOrderItems,
  getOrderItemsByOrderId,
  deleteOrderItem,
} from "../controllers/OrderItem.js";

const router = express.Router();

router.get("/", getAllOrderItems);
router.get("/order/:orderId", getOrderItemsByOrderId);
router.delete("/:id", deleteOrderItem);

export default router;
