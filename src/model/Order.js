import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  shippingAddress: { type: String, required: true },
  paymentMethod: {
  type: String,
  enum: {
    values: ["COD", "VNPay", "Stripe", "Momo"],
    message: "Phương thức thanh toán không hợp lệ",
  },
  default: "COD",
},

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
