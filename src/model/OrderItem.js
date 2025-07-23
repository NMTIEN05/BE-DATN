// src/models/OrderItem.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  name: { type: String }, // optional để tiện hiển thị
  image: { type: String }, // optional ảnh đại diện sản phẩm
}, { timestamps: true });

export default mongoose.model("OrderItem", orderItemSchema);
