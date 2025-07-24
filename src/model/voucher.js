import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true },
  maxDiscount: { type: Number }, // optional: cho % có giới hạn
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  minOrderValue: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model("Voucher", voucherSchema);