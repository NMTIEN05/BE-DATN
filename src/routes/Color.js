import express from "express";
import { createColor, deleteColor, getAllColors, getColorById,updateColor } from "../controllers/Color.js";
const router = express.Router();

router.post("/", createColor);
router.get("/", getAllColors);
router.get("/:id", getColorById);
router.delete("/:id", deleteColor);
router.put("/:id",updateColor );




// router.get("/", getAllProducts);
export default router;
