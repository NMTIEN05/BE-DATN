import express from "express";
import { createProduct,getVariantsByProductId,getProductBySlug,deleteProduct,getProductsByGroup, getAllProducts, getProductById, updateProduct } from "../controllers/Product.js";
// import { getVariantDetailById } from "../controllers/Variant.js";


const router = express.Router();

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id/variant", getVariantsByProductId);

router.get("/group/:groupId", getProductsByGroup);
// Route khác: GET /api/product/slug/:slug
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);




export default router;
