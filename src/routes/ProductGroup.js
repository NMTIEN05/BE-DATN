import express from "express";
import {
  getAllProductGroups,
  getProductGroupBySlug,
  getProductGroupById,
  createProductGroup,
  updateProductGroup,
  deleteProductGroup,
  getProductsByGroupId,
} from "../controllers/ProductGroup.js";

const router = express.Router();

// Lấy tất cả nhóm
router.get("/", getAllProductGroups);

// Lấy nhóm theo slug
router.get("/slug/:slug", getProductGroupBySlug);

// Lấy nhóm theo id
router.get("/:id", getProductGroupById);

// Lấy danh sách sản phẩm thuộc nhóm
router.get("/:id/products", getProductsByGroupId);

// Tạo, cập nhật, xoá nhóm
router.post("/", createProductGroup);
router.put("/:id", updateProductGroup);
router.delete("/:id", deleteProductGroup);

export default router;
