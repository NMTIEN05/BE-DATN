import express from "express";
import {
  createCategory,
  deleteCategory,          // 👈 xoá mềm (gán deletedAt)
  getCategory,            // 👈 lấy tất cả chưa xoá
  getCategorybyId,        // 👈 lấy theo id
  updateCategory,
  getProductGroupsByCategoryId,
  forceDeleteCategory,    // 👈 xoá cứng
  getDeletedCategories,   // 👈 danh sách đã xoá mềm
  restoreCategory         // 👈 khôi phục
} from "../controllers/Category.js";

const router = express.Router();

// 🔥 QUAN TRỌNG: /deleted PHẢI đặt TRƯỚC /:id
router.get("/deleted", getDeletedCategories);
router.put("/:id/restore", restoreCategory);         // khôi phục
router.delete("/:id/force", forceDeleteCategory);    // xoá cứng

// ✅ CÁC ROUTE CHÍNH
router.post("/", createCategory);
router.get("/", getCategory);
router.get("/:id", getCategorybyId);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.get("/:id/product-groups", getProductGroupsByCategoryId);               // xoá mềm

export default router;
