import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
      deletedAt: {
      type: Date,
      default: null,
    },
      imageUrl: {
  type: [String],  // Mảng các URL ảnh
  required: true,  // hoặc false nếu không bắt buộc
  default: [],
},
},
{ timestamps: true, versionKey: false }
    
)
const Category = mongoose.model("Category", categorySchema);
export default Category;