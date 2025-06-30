import Joi from "joi";
import joiObjectId from "joi-objectid";

Joi.objectId = joiObjectId(Joi);

// ✅ Schema validate cho sản phẩm
export const productSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    "string.empty": "Tên sản phẩm không được để trống",
    "string.min": "Tên sản phẩm phải có ít nhất 3 ký tự",
    "any.required": "Tên sản phẩm là bắt buộc",
  }),

  slug: Joi.string().required().messages({
    "string.empty": "Slug không được để trống",
    "any.required": "Slug là bắt buộc",
  }),

  capacity: Joi.string().required().messages({
    "string.empty": "Dung lượng không được để trống",
    "any.required": "Dung lượng là bắt buộc",
  }),

  imageUrl: Joi.array().items(Joi.string().uri()).min(1).required().messages({
    "array.base": "Ảnh phải là một mảng URL",
    "array.min": "Phải có ít nhất 1 ảnh",
    "any.required": "Ảnh là bắt buộc",
    "string.uri": "URL ảnh không hợp lệ",
  }),

  description: Joi.string().allow("").max(2000).messages({
    "string.max": "Mô tả không được vượt quá 2000 ký tự",
  }),

  shortDescription: Joi.string().allow("").max(500).messages({
    "string.max": "Mô tả ngắn không được vượt quá 500 ký tự",
  }),

  priceDefault: Joi.number().min(0).required().messages({
    "number.base": "Giá phải là số",
    "number.min": "Giá không được âm",
    "any.required": "Giá là bắt buộc",
  }),

  groupId: Joi.objectId().required().messages({
    "any.required": "groupId là bắt buộc",
    "string.pattern.name": "groupId không hợp lệ",
  }),

  categoryId: Joi.objectId().required().messages({
    "any.required": "categoryId là bắt buộc",
    "string.pattern.name": "categoryId không hợp lệ",
  }),

  variants: Joi.array().items(Joi.objectId()).messages({
    "array.base": "Biến thể phải là một mảng ObjectId",
    "string.pattern.name": "ID biến thể không hợp lệ",
  }),

  soldCount: Joi.number().min(0).messages({
    "number.base": "Số lượng đã bán phải là số",
    "number.min": "Số lượng đã bán không được âm",
  }),

  deletedAt: Joi.date().optional(),
  deletedBy: Joi.objectId().optional(),
});
