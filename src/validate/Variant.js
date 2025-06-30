import Joi from "joi";
import joiObjectId from "joi-objectid";

Joi.objectId = joiObjectId(Joi);

export const variantSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Tên biến thể không được để trống",
    "string.min": "Tên biến thể phải có ít nhất 1 ký tự",
    "any.required": "Tên biến thể là bắt buộc",
  }),

  imageUrl: Joi.array()
    .items(Joi.string().uri().messages({ "string.uri": "URL ảnh không hợp lệ" }))
    .min(1)
    .required()
    .messages({
      "array.base": "Ảnh phải là mảng URL",
      "array.min": "Cần ít nhất 1 ảnh",
      "any.required": "Ảnh là bắt buộc",
    }),

  price: Joi.number().min(0).required().messages({
    "number.base": "Giá phải là số",
    "number.min": "Giá không được âm",
    "any.required": "Giá là bắt buộc",
  }),

  oldPrice: Joi.number().min(0).allow(null).messages({
    "number.base": "Giá cũ phải là số",
    "number.min": "Giá cũ không được âm",
  }),

  stock: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Tồn kho phải là số nguyên",
    "number.min": "Tồn kho không được âm",
  }),

  productId: Joi.objectId().required().messages({
    "any.required": "ID sản phẩm là bắt buộc",
    "string.pattern.name": "ID sản phẩm không hợp lệ",
  }),

  attributes: Joi.array()
    .items(
      Joi.object({
        attributeId: Joi.objectId().required().messages({
          "any.required": "ID thuộc tính là bắt buộc",
          "string.pattern.name": "ID thuộc tính không hợp lệ",
        }),
        attributeValueId: Joi.objectId().required().messages({
          "any.required": "ID giá trị thuộc tính là bắt buộc",
          "string.pattern.name": "ID giá trị thuộc tính không hợp lệ",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Danh sách thuộc tính phải là mảng",
      "array.min": "Cần ít nhất 1 thuộc tính",
      "any.required": "Thuộc tính là bắt buộc",
    }),

  deletedAt: Joi.date().allow(null),
  deletedBy: Joi.objectId().allow(null),
});
