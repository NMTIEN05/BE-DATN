import Joi from "joi";
import JoiObjectId from "joi-objectid";

Joi.objectId = JoiObjectId(Joi); // để validate ObjectId

// ✅ Validate khi tạo mới AttributeValue
export const createAttributeValueSchema = Joi.object({
  value: Joi.string().required(),
  valueCode: Joi.string().required(),
  imageUrl: Joi.string().uri().allow(""), // nếu có ảnh, kiểm tra URL
  attributeId: Joi.objectId().required(),

  // Không cần gửi từ client:
  deletedAt: Joi.any().forbidden(),
  deletedBy: Joi.any().forbidden(),
});

// ✅ Validate khi cập nhật AttributeValue
export const updateAttributeValueSchema = Joi.object({
  value: Joi.string(),
  valueCode: Joi.string(),
  imageUrl: Joi.string().uri().allow(""),
  attributeId: Joi.objectId(),

  // Không cho sửa từ client
  deletedAt: Joi.any().forbidden(),
  deletedBy: Joi.any().forbidden(),
}).min(1);
