import express from "express";
import {
  getCapacityById,
  getAllCapacities,
  createCapacity,
  deleteCapacity,
  updateCapacity,
  getDeletedCapacities,
  restoreCapacity,
  forceDeleteCapacity
} from "../controllers/Capacity.js";

const router = express.Router();

router.post("/", createCapacity);
router.get("/", getAllCapacities);
router.get("/:id", getCapacityById);
router.put("/:id", updateCapacity);
router.delete("/:id", deleteCapacity);
router.get("/deleted", getDeletedCapacities); // đã xoá
router.put("/:id/restore", restoreCapacity); // khôi phục
router.delete("/:id/force", forceDeleteCapacity); // xoá vĩnh viễn

export default router;
