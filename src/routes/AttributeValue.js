
import express from "express";
import {
  getAllAttributeValues,
  getAttributeValueById,
  createAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
} from "../controllers/AttributeValue.js";

const router = express.Router();

router.get("/", getAllAttributeValues);
router.get("/:id", getAttributeValueById);
router.post("/", createAttributeValue);
router.put("/:id", updateAttributeValue);
router.delete("/:id", deleteAttributeValue);

export default router;
