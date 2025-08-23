import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true, // Giá hiện tại (flash sale hoặc bình thường)
    },
    flashSaleApplied: {
      type: Boolean,
      default: false, // Có áp dụng flash sale không
    },
    flashSalePrice: {
      type: Number,
      default: null, // Giá flash sale nếu có
    },
    discountPercent: {
      type: Number,
      default: 0, // % giảm nếu có flash sale
    },
    flashSaleStart: { type: Date, default: null },
    flashSaleEnd: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("CartItem", cartItemSchema);
