import express from "express";
import {
  getAllProductGroups,
  getProductGroupBySlug,
  createProductGroup,
  updateProductGroup,
  deleteProductGroup,
  getProductsByGroupId,
  getProductGroupById,
} from "../controllers/ProductGroup.js";

const router = express.Router();

router.get("/", getAllProductGroups); // /api/productGroup
router.get("/slug/:slug", getProductGroupBySlug); // /api/productGroup/slug/:slug
router.get("/:id", getProductGroupById); // /api/productGroup/:id
router.get("/:id/products", getProductsByGroupId); // /api/productGroup/:id/products
router.post("/", createProductGroup);
router.put("/:id", updateProductGroup);
router.delete("/:id", deleteProductGroup);
export default router;
