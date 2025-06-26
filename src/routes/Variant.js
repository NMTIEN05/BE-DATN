  import express from "express";
  import {
    getAllVariants,
    getVariantById,
    createVariant,
    updateVariant,
    deleteVariant,
    getVariantsByProductId,
    getVariantDetailById,
  } from "../controllers/Variant.js";

  const router = express.Router();


router.get("/", getAllVariants);
router.get("/product/:productId/variant", getVariantsByProductId);
router.get("/product/:productId/variant/:variantId", getVariantDetailById);
router.post("/", createVariant);
router.put("/:id", updateVariant);
router.delete("/:id", deleteVariant);

// Đặt sau cùng
router.get("/:id", getVariantById);




  export default router;
