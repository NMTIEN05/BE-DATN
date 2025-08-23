import mongoose from "mongoose";

const flashSaleSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
  salePrice: { type: Number, required: true },
  quantity: { type: Number, required: true }, // tổng số xuất flash sale
  soldQuantity: { type: Number, default: 0 }, // số lượng đã bán
  discountPercent: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  limitQuantity: { type: Number, default: 0 }, // mỗi khách được mua tối đa
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Đảm bảo mỗi flash sale chỉ sale 1 sản phẩm tại 1 thời điểm
// flashSaleSchema.index({ product: 1 }, { unique: true });

export default mongoose.model("FlashSale", flashSaleSchema);
