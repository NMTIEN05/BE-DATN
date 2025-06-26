import express from "express";
import { createProduct,getVariantsByProductId,getProductBySlug,deleteProduct,getProductsByGroup, getAllProducts, getProductById, updateProduct } from "../controllers/Product.js";
<<<<<<< HEAD
import { getVariantDetailById } from "../controllers/Variant.js";
=======
// import { getVariantDetailById } from "../controllers/Variant.js";
>>>>>>> 28818bc (Làm tính năng người dùng và phân quyền)


const router = express.Router();

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id/variant", getVariantsByProductId);
<<<<<<< HEAD
router.get("/:productId/variant/:variantId", getVariantDetailById);
=======
>>>>>>> 28818bc (Làm tính năng người dùng và phân quyền)

router.get("/group/:groupId", getProductsByGroup);
// Route khác: GET /api/product/slug/:slug
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);




export default router;
