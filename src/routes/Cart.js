import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartItemWithUser
} from "../controllers/Cart.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/add", addToCart);
router.get("/", getCart);
router.put("/update/:itemId", updateCartItem);
router.delete("/remove/:itemId", removeCartItem);
router.delete("/clear", clearCart);
router.get("/cart-item-user/:itemId", getCartItemWithUser);


export default router;
