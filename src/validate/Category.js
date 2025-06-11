import Joi from "joi";

export const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Tên danh mục không được để trống",
    "string.min": "Tên danh mục phải có ít nhất 2 ký tự",
    "any.required": "Tên danh mục là bắt buộc",
  }),
  description: Joi.string().allow("").max(500).messages({
    "string.max": "Mô tả không được vượt quá 500 ký tự",
  }),
  imageUrl: Joi.string().uri().required().messages({
    "string.empty": "URL ảnh không được để trống",
    "any.required": "Ảnh là bắt buộc",
    "string.uri": "URL ảnh không hợp lệ",
  }),
});
