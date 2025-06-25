import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		imageUrl: {
  type: [String],  // Mảng các URL ảnh
  required: true,  // hoặc false nếu không bắt buộc
  default: [],
},
		price: { type: Number, required: true },
		oldPrice: { type: Number, default: null },
		
		stock: { type: Number, default: 0 },
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
	attributes: [
  {
    attributeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
    },
    attributeValueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttributeValue",
      required: true,
    },
  },
],
		  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
	},
	{
		versionKey: false,
		timestamps: true,
	}
);

const Variant = mongoose.model("Variant", variantSchema);

export default Variant;