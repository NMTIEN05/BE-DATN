import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Tên đầy đủ của sản phẩm (kèm dung lượng)
    title: { type: String, required: true }, // VD: iPhone 16 128GB

    // Đường dẫn SEO-friendly
    slug: { type: String, required: true }, // VD: iphone-16-128gb

    capacity :{type: String , required: true}, 
    // Ảnh chính
   imageUrl: {
  type: [String],  // Mảng các URL ảnh
  required: true,  // hoặc false nếu không bắt buộc
  default: [],
},

    // Mô tả chi tiết & ngắn
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },

    // Giá chính thức
    priceDefault: { type: Number, required: true },

    // Dung lượng của bản này
    

    // Liên kết tới dòng sản phẩm cha (VD: iPhone 16)
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductGroup",
      required: true,
    },

    // Liên kết tới danh mục (VD: Điện thoại, Máy tính bảng...)
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // Danh sách biến thể (VD: các màu sắc khác nhau)
    variants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
      },
    ],

    // Số lượng đã bán
    soldCount: { type: Number, default: 0 },

    // Xoá mềm
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false, timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
