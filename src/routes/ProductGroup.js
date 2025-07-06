import express from "express";
import {
  getAllProductGroups,
  getProductGroupBySlug,
  getProductGroupById,
  createProductGroup,
  updateProductGroup,
  deleteProductGroup,
  getProductsByGroupId,
  getDeletedProductGroups,
  restoreProductGroup,          // ✅ MỚI
  forceDeleteProductGroup,      // ✅ MỚI
  forceDeleteAllProductGroups,  // ✅ MỚI
} from "../controllers/ProductGroup.js";

const router = express.Router();

// ✅ Route khôi phục, xoá cứng (ĐẶT TRƯỚC /:id)
router.put("/:id/restore", restoreProductGroup);                // ♻️ Khôi phục
router.delete("/:id/force", forceDeleteProductGroup);           // 🗑️ Xoá vĩnh viễn
router.delete("/force-all", forceDeleteAllProductGroups);       // 🗑️ Xoá tất cả

// ✅ Lấy nhóm đã xoá mềm
router.get("/deleted", getDeletedProductGroups);

// 🧩 Các route còn lại
router.get("/", getAllProductGroups);
router.get("/slug/:slug", getProductGroupBySlug);
router.get("/:id", getProductGroupById);
router.get("/:id/products", getProductsByGroupId);
router.post("/", createProductGroup);
router.put("/:id", updateProductGroup);
router.delete("/:id", deleteProductGroup);

export default router;
