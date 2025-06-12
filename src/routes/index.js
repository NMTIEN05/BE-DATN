import express from "express";
import categoryRoutes from "../routes/Category.js";
import capacityRoutes from "../routes/Capacity.js";

const router = express.Router();

// Kiểm tra kết nối frontend
router.get("/ping", (req, res) => {
  console.log("Frontend đã kết nối thành công");
  res.json({ message: "Backend kết nối thành công!" });
});


router.use("/category", categoryRoutes);
router.use("/capacity", capacityRoutes);

export default router;
