import mongoose from "mongoose";

const flashSaleSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  salePrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  discountPercent: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  limitQuantity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Đảm bảo **mỗi flash sale chỉ sale 1 sản phẩm tại 1 thời điểm**
// Nếu muốn cùng 1 sản phẩm có nhiều flash sale khác thời gian, bỏ index unique
// flashSaleSchema.index({ product: 1 }, { unique: true });

export default mongoose.model("FlashSale", flashSaleSchema);
