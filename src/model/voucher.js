import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true },
  maxDiscount: { type: Number }, // optional: cho % có giới hạn
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  minOrderValue: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  description: { type: String },
  userUsageLimit: { type: Number, default: 1 },
}, { timestamps: true });

// ✅ Sửa chỗ này để tránh lỗi OverwriteModelError
export default mongoose.models.Voucher || mongoose.model("Voucher", voucherSchema);
