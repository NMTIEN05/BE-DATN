import express from "express";
import { createFlashSale, getAllFlashSales,getFlashSaleByVariant,getFlashSaleById,getFlashSaleByProduct, deleteFlashSale, updateFlashSale } from "../controllers/flashSale.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import { getVariantsByProductId } from "../controllers/Variant.js";

const router = express.Router();

// Admin tạo flash sale
router.post("/", authenticate, requireAdmin, createFlashSale);

// Lấy tất cả flash sale
// Lấy tất cả flash sale
router.get("/", getAllFlashSales);

// Lấy flash sale theo sản phẩm (đặt trước để ưu tiên match)
router.get("/product/:productId", getFlashSaleByProduct);

// Lấy flash sale theo biến thể
router.get("/:productId/:variantId", getFlashSaleByVariant);
router.get("/product/:productId", getVariantsByProductId);


// Lấy flash sale theo ID
router.get("/:id", getFlashSaleById);
// Xóa FlashSale
router.delete("/:id", authenticate, requireAdmin, deleteFlashSale);
// Sửa 
router.put("/:id", authenticate, requireAdmin, updateFlashSale);

export default router;
