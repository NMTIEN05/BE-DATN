import Joi from "joi";
import joiObjectId from "joi-objectid";

Joi.objectId = joiObjectId(Joi);

export const productGroupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Tên dòng sản phẩm không được để trống",
    "string.min": "Tên dòng sản phẩm phải có ít nhất 2 ký tự",
    "any.required": "Tên dòng sản phẩm là bắt buộc",
  }),

  slug: Joi.string().required().messages({
    "string.empty": "Slug không được để trống",
    "any.required": "Slug là bắt buộc",
  }),
   
  imageUrl: Joi.array()
    .items(Joi.string().uri().messages({ "string.uri": "URL ảnh không hợp lệ" }))
    .min(1)
    .required()
    .messages({
      "array.base": "Ảnh phải là một mảng",
      "array.min": "Cần ít nhất 1 ảnh",
      "any.required": "Ảnh là bắt buộc",
    }),

  description: Joi.string().allow("").max(1000),
  shortDescription: Joi.string().allow("").max(500),

  brand: Joi.string().default("Apple"),

  categoryId: Joi.objectId().required().messages({
    "any.required": "Category là bắt buộc",
    "string.pattern.name": "ID danh mục không hợp lệ",
  }),
});
