import express from "express";
import {
  getCapacityById,
  getAllCapacities,
  createCapacity,
  deleteCapacity,
  updateCapacity,
} from "../controllers/Capacity.js";

const router = express.Router();

router.post("/", createCapacity);
router.get("/", getAllCapacities);
router.get("/:id", getCapacityById);
router.put("/:id", updateCapacity);
router.delete("/:id", deleteCapacity);

export default router;
