import mongoose from "mongoose";
import FlashSale from "../model/flashSale.js";
import Product from "../model/Product.js";

export const createFlashSale = async (req, res) => {
  try {
    const { product, salePrice, quantity, discountPercent, startTime, endTime, limitQuantity, isActive } = req.body;

    if (!product || !salePrice || !quantity || !discountPercent || !startTime || !endTime) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const existedProduct = await Product.findById(product);
    if (!existedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra trùng flash sale cùng product trong cùng khoảng thời gian
    const overlapped = await FlashSale.findOne({
      product,
      startTime: { $lte: new Date(endTime) },
      endTime: { $gte: new Date(startTime) },
      isActive: true,
    });

    if (overlapped) {
      return res.status(400).json({ message: "Sản phẩm đã có flash sale trong thời gian này" });
    }

    const flashSale = await FlashSale.create({
      product,
      salePrice,
      quantity,
      discountPercent,
      startTime,
      endTime,
      limitQuantity: limitQuantity || 0,
      isActive: isActive ?? true,
    });

    res.status(201).json({ message: "Tạo flash sale thành công", data: flashSale });
  } catch (error) {
    console.error("❌ Lỗi tạo flash sale:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const getAllFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find().populate("product");
    res.status(200).json({ success: true, data: flashSales });
  } catch (error) {
    console.error("❌ Lỗi lấy flash sale:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
