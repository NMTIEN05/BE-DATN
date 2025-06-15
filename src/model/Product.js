import mongoose from 'mongoose';

// Schema cho từng biến thể (màu + dung lượng) – KHÔNG có imageUrl nữa
const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true
  },
  storage: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  }
}, { _id: false }); // Không tạo _id riêng cho mỗi biến thể

// Schema cho sản phẩm
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  variants: {
    type: [variantSchema],
    required: true,
    validate: [(value) => value.length > 0, 'At least one variant is required.']

  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
