// models/ProductGroup.ts
import mongoose from "mongoose";

const productGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // VD: iPhone 16
    slug: { type: String, required: true, unique: true }, // VD: iphone-16
    capacity:{type: String, required: true, unique: true},

    imageUrl: {
      type: [String], // Mảng URL ảnh
      required: true,
      default: [],
    },

    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    brand: { type: String, default: "Apple" },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    deletedAt: { type: Date, default: null },
  },
  { versionKey: false, timestamps: true }
);

const ProductGroup = mongoose.model("ProductGroup", productGroupSchema);
export default ProductGroup;
