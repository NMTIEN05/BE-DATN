// src/model/OrderItem.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("OrderItem", orderItemSchema);
