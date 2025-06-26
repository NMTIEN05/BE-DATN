import Variant from "../model/Variant.js";

// Kiểm tra tồn kho trước khi thêm
export const validateStock = async (req, res, next) => {
  const { variantId, quantity } = req.body;

  try {
    const variant = await Variant.findById(variantId);
    if (!variant) return res.status(404).json({ message: "Không tìm thấy biến thể" });

    if (variant.stock < quantity) {
      return res.status(400).json({ message: "Không đủ hàng trong kho" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Lỗi kiểm tra tồn kho", error: err.message });
  }
};

// Cảnh báo nếu còn ít hàng (dưới 5 sp)
export const lowStockWarning = async (req, res, next) => {
  const { variantId } = req.body;

  try {
    const variant = await Variant.findById(variantId);
    if (variant && variant.stock <= 5) {
      console.warn(`⚠️ Sản phẩm ${variant.name} sắp hết hàng (${variant.stock} sp)!`);
    }
    next();
  } catch (err) {
    console.error("Lỗi cảnh báo tồn kho thấp:", err);
    next(); // vẫn cho qua nếu lỗi
  }
};
