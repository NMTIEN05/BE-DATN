import express from "express";
import {
  getAllProductGroups,
  getProductGroupBySlug,
  createProductGroup,
  updateProductGroup,
  deleteProductGroup,
  getProductsByGroupId,
<<<<<<< HEAD
=======
  getProductGroupById,
>>>>>>> 28818bc (Làm tính năng người dùng và phân quyền)
} from "../controllers/ProductGroup.js";

const router = express.Router();

<<<<<<< HEAD
router.get("/", getAllProductGroups);
router.get("/:slug", getProductGroupBySlug);
router.post("/", createProductGroup);
router.put("/:id", updateProductGroup);
router.delete("/:id", deleteProductGroup);

router.get("/:id/products", getProductsByGroupId);

=======
router.get("/", getAllProductGroups); // /api/productGroup
router.get("/slug/:slug", getProductGroupBySlug); // /api/productGroup/slug/:slug
router.get("/:id", getProductGroupById); // /api/productGroup/:id
router.get("/:id/products", getProductsByGroupId); // /api/productGroup/:id/products
router.post("/", createProductGroup);
router.put("/:id", updateProductGroup);
router.delete("/:id", deleteProductGroup);
>>>>>>> 28818bc (Làm tính năng người dùng và phân quyền)
export default router;
