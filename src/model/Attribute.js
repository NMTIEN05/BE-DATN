import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		attributeCode: { type: String, required: true, unique: true },
		slug: { type: String, required: true, unique: true },
		values: { type: [String], default: [] },
		description: { type: String, default: "" },

		seoTitle: { type: String, default: "" },
		seoDescription: { type: String, default: "" },
		tags: { type: [String], default: [] },

		deletedAt: { type: Date, default: null },
		deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{
		versionKey: false,
		timestamps: true,
	}
);

const Attribute = mongoose.model("Attribute", attributeSchema);

export default Attribute;
