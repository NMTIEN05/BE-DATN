import express from "express";
import categoryRoutes from "../routes/Category.js";
import capacityRoutes from "../routes/Capacity.js";
import productRoutes from "../routes/Product.js";
import colerRouter from "../routes/Color.js";

const router = express.Router();

// Kiểm tra kết nối frontend
router.get("/ping", (req, res) => {
  console.log("Frontend đã kết nối thành công");
  res.json({ message: "Backend kết nối thành công!" });
});

// Đăng ký các route
router.use("/category", categoryRoutes);
router.use("/capacity", capacityRoutes);
router.use("/product",  productRoutes );
router.use("/coler",  colerRouter );


export default router;
