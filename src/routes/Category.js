import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategorybyId,
  updateCategory,
} from "../controllers/Category.js";

const router = express.Router();

router.post("/", createCategory);
router.get("/", getCategory);
router.get("/:id", getCategorybyId);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
