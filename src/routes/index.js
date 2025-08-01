import express from "express";
import categoryRoutes from "../routes/Category.js";
import capacityRoutes from "../routes/Capacity.js";
import productRoutes from "../routes/Product.js";
import colerRouter from "../routes/Color.js";
import variantRoutes from "../routes/Variant.js";
import attributeRoutes from "../routes/Attribute.js";
import productGroupRoutes from "../routes/ProductGroup.js";
import attributeValueRoutes from "../routes/AttributeValue.js";
import userRoutes from "../routes/User.js"; // Đã thêm dòng này từ nhánh mới
import cartRoutes from "../routes/Cart.js";
import orderRoutes from "../routes/Order.js";
import orderItemRoutes from "../routes/OrderItem.js";
import bannerRoutes from "../routes/banner.js"; // Đã thêm dòng này từ nhánh mới
import wishlistRoutes from "../routes/wishlist.js"; // Đã thêm dòng này từ nhánh mới
import commentRoutes from '../routes/comment.js';
import flashSaleRoutes from '../routes/flashSale.js';


const router = express.Router();
// Kiểm tra kết nối frontend
router.get("/ping", (req, res) => {
  console.log("Frontend đã kết nối thành công");
  res.json({ message: "Backend kết nối thành công!" });
});

// Đăng ký các route
router.use("/category", categoryRoutes);
router.use("/capacity", capacityRoutes);
router.use("/product", productRoutes);
router.use("/productGroup", productGroupRoutes);
router.use("/color", colerRouter);
router.use("/variants", variantRoutes);
router.use("/attributes", attributeRoutes);
router.use("/AttributeValue", attributeValueRoutes);
router.use("/auth", userRoutes); 
router.use("/cart",cartRoutes);
router.use('/banners', bannerRoutes);
router.use('/flashsales', flashSaleRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/comments', commentRoutes);
router.use("/orders",orderRoutes)
router.use("/orderitem", orderItemRoutes);


export default router;
