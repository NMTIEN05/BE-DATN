import mongoose from "mongoose";

const attributeValueSchema = new mongoose.Schema(
	{
		value: { type: String, required: true },
		valueCode: { type: String, required: true },
		imageUrl: { type: String }, 
		attributeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Attribute",
			required: true,
		},

		deletedAt: { type: Date, default: null },
		deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{
		versionKey: false,
		timestamps: true,
	}
);

const AttributeValue = mongoose.model("AttributeValue", attributeValueSchema);

export default AttributeValue;