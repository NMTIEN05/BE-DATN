import mongoose from "mongoose";
import FlashSale from "../model/flashSale.js";
import Product from "../model/Product.js";
import Variant from "../model/Variant.js";

// Tạo flash sale cho biến thể
export const createFlashSale = async (req, res) => {
  try {
    const { product, variant, salePrice, quantity, discountPercent, startTime, endTime, limitQuantity, isActive } = req.body;

    if (!product || !variant || !salePrice || !quantity || !discountPercent || !startTime || !endTime) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    if (!mongoose.Types.ObjectId.isValid(product) || !mongoose.Types.ObjectId.isValid(variant)) {
      return res.status(400).json({ message: "ID sản phẩm hoặc biến thể không hợp lệ" });
    }

    const existedProduct = await Product.findById(product);
    if (!existedProduct) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const existedVariant = await Variant.findById(variant);
    if (!existedVariant) return res.status(404).json({ message: "Biến thể không tồn tại" });

    // Kiểm tra trùng flash sale cùng variant trong cùng khoảng thời gian
    const overlapped = await FlashSale.findOne({
      product,
      variant,
      startTime: { $lte: new Date(endTime) },
      endTime: { $gte: new Date(startTime) },
      isActive: true,
    });

    if (overlapped) {
      return res.status(400).json({ message: "Biến thể này đã có flash sale trong thời gian này" });
    }

    const flashSale = await FlashSale.create({
      product,
      variant,
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

// Lấy tất cả flash sale
export const getAllFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find()
      .populate("product")
      .populate({
        path: "variant",
        select: "_id name price oldPrice stock imageUrl attributes"
      });

    res.status(200).json({ success: true, data: flashSales });
  } catch (error) {
    console.error("❌ Lỗi lấy flash sale:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy flash sale theo ID
export const getFlashSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const flashSale = await FlashSale.findById(id)
      .populate("product")
      .populate({
        path: "variant",
        select: "_id name price oldPrice stock imageUrl attributes"
      });

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        message: "Flash sale không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      data: flashSale,
    });
  } catch (error) {
    console.error("❌ Lỗi getFlashSaleById:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy flash sale theo biến thể (productId + variantId)
export const getFlashSaleByVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(400).json({ message: "ID sản phẩm hoặc biến thể không hợp lệ" });
    }

    const flashSale = await FlashSale.findOne({
      product: productId,
      variant: variantId,
      isActive: true,
      startTime: { $lte: new Date() },
      endTime: { $gte: new Date() },
    })
      .populate("product")
      .populate({
        path: "variant",
        select: "_id name price oldPrice stock imageUrl attributes"
      });

    if (!flashSale) {
      return res.status(404).json({ message: "Không tìm thấy flash sale cho biến thể này" });
    }

    res.status(200).json({ success: true, data: flashSale });
  } catch (error) {
    console.error("❌ Lỗi lấy flash sale theo biến thể:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
// Lấy flash sale theo sản phẩm
export const getFlashSaleByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }

    const flashSale = await FlashSale.findOne({ product: productId, isActive: true })
      .populate("product")
      .populate({
        path: "variant",
        select: "_id name price oldPrice stock imageUrl attributes"
      });

    if (!flashSale) {
      return res.status(404).json({ success: false, message: "Không có flash sale cho sp này" });
    }

    res.status(200).json({ success: true, data: flashSale });
  } catch (err) {
    console.error("❌ Lỗi getFlashSaleByProduct:", err);
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};
export const deleteFlashSale = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID flash sale không hợp lệ" });
    }

    const flashSale = await FlashSale.findByIdAndDelete(id);

    if (!flashSale) {
      return res.status(404).json({ success: false, message: "Flash sale không tồn tại" });
    }

    res.status(200).json({
      success: true,
      message: "Xóa flash sale thành công",
      data: flashSale,
    });
  } catch (error) {
    console.error("❌ Lỗi deleteFlashSale:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};
// Cập nhật flash sale
export const updateFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product,
      variant,
      salePrice,
      quantity,
      discountPercent,
      startTime,
      endTime,
      limitQuantity,
      isActive,
    } = req.body;

    const flashSale = await FlashSale.findById(id);
    if (!flashSale) {
      return res.status(404).json({ message: "Flash sale không tồn tại" });
    }

    // Nếu truyền product hoặc variant mới thì kiểm tra hợp lệ
    if (product && !mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }
    if (variant && !mongoose.Types.ObjectId.isValid(variant)) {
      return res.status(400).json({ message: "ID biến thể không hợp lệ" });
    }

    // Kiểm tra sản phẩm & biến thể có tồn tại không
    if (product) {
      const existedProduct = await Product.findById(product);
      if (!existedProduct) return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    if (variant) {
      const existedVariant = await Variant.findById(variant);
      if (!existedVariant) return res.status(404).json({ message: "Biến thể không tồn tại" });
    }

    // Gán giá trị mới
    flashSale.product = product || flashSale.product;
    flashSale.variant = variant || flashSale.variant;
    flashSale.salePrice = salePrice ?? flashSale.salePrice;
    flashSale.quantity = quantity ?? flashSale.quantity;
    flashSale.discountPercent = discountPercent ?? flashSale.discountPercent;
    flashSale.startTime = startTime || flashSale.startTime;
    flashSale.endTime = endTime || flashSale.endTime;
    flashSale.limitQuantity = limitQuantity ?? flashSale.limitQuantity;
    flashSale.isActive = isActive ?? flashSale.isActive;

    await flashSale.save();

    res.status(200).json({ success: true, message: "Cập nhật flash sale thành công", data: flashSale });
  } catch (error) {
    console.error("❌ Lỗi updateFlashSale:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};



