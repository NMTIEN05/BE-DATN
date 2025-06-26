import express from "express";
import { addToCart,getCart,removeFromCart, updateQuantity,clearCart } from "../controllers/Cart.js";
import { validateStock, lowStockWarning } from "../middlewares/stockValidation.js"
import { requireAuth } from "../middlewares/requireAuth.js";




const router = express.Router();

router.use(requireAuth);
router.post("/add-cart", requireAuth, validateStock , lowStockWarning , addToCart);
router.get("/",getCart)
router.put("/update", updateQuantity);
// routes/Cart.js
router.delete("/remove/:itemId", requireAuth, removeFromCart);
router.delete("/clear", clearCart);



export default router;
