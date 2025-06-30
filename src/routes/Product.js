import express from "express";
import {
  createProduct,
  getVariantsByProductId,
  getProductBySlug,
  deleteProduct,
  getProductsByGroup,
  getAllProducts,
  getProductById,
  updateProduct,
  restoreProduct,
  hardDeleteProduct,
  // hardDeleteAllProducts
} from "../controllers/Product.js";
import { getVariantDetailById } from "../controllers/Variant.js"; // Giữ lại import hợp lệ

const router = express.Router();

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id/variant", getVariantsByProductId);
router.get("/:productId/variant/:variantId", getVariantDetailById); // Giữ lại route chi tiết biến thể
router.get("/group/:groupId", getProductsByGroup);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/restore", restoreProduct);
router.delete("/:id/hard", hardDeleteProduct); 
// router.delete("/hard-all", hardDeleteAllProducts);
export default router;
