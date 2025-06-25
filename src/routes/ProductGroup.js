import express from "express";
import {
  getAllProductGroups,
  getProductGroupBySlug,
  createProductGroup,
  updateProductGroup,
  deleteProductGroup,
  getProductsByGroupId,
} from "../controllers/ProductGroup.js";

const router = express.Router();

router.get("/", getAllProductGroups);
router.get("/:slug", getProductGroupBySlug);
router.post("/", createProductGroup);
router.put("/:id", updateProductGroup);
router.delete("/:id", deleteProductGroup);

router.get("/:id/products", getProductsByGroupId);

export default router;
