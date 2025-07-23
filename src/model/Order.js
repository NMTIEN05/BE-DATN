import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true
  },

  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrderItem",
    required: true
  }],

  totalAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: [
      "pending",             // Chờ xác nhận
      "processing",          // Đang xử lý
      "ready_to_ship",       // Chờ giao hàng
      "shipped",             // Đang giao
      "delivered",           // Đã giao
      "return_requested",    // Yêu cầu trả hàng
      "returned",            // Đã hoàn trả
      "cancelled"            // Đã hủy
    ],
    default: "pending"
  },

  shippingInfo: {
    fullName: { type: String, required: true },       // Họ tên người nhận
    phone: { type: String, required: true },          // Số điện thoại
    address: { type: String, required: true },        // Địa chỉ chi tiết (đầy đủ)
    // Mở rộng thêm nếu cần:
    ward: { type: String },       // Phường/xã (tuỳ chọn)
    district: { type: String },   // Quận/huyện (tuỳ chọn)
    province: { type: String }    // Tỉnh/thành phố (tuỳ chọn)
  },

  paymentMethod: {
    type: String,
    enum: {
      values: ["COD", "VNPay", "Stripe", "Momo"],
      message: "Phương thức thanh toán không hợp lệ"
    },
    default: "COD"
  },

  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "failed"],
    default: "unpaid"
  },

  isDeleted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);