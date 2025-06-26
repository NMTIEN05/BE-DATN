// models/ProductGroup.ts
import mongoose from "mongoose";

const productGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // VD: iPhone 16
    slug: { type: String, required: true, unique: true }, // VD: iphone-16
<<<<<<< HEAD
    imageUrl: { type: String, required: true },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    brand: { type: String, default: "Apple" }, // hoặc ref Brand nếu có
=======
   imageUrl: {
  type: [String],  // Mảng các URL ảnh
  required: true,  // hoặc false nếu không bắt buộc
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
    
>>>>>>> 28818bc (Làm tính năng người dùng và phân quyền)
    deletedAt: { type: Date, default: null },
  },
  { versionKey: false, timestamps: true }
);

const ProductGroup = mongoose.model("ProductGroup", productGroupSchema);
export default ProductGroup;
