import Joi from "joi";
import joiObjectId from "joi-objectid";

Joi.objectId = joiObjectId(Joi);

// ✅ Validate khi thêm sản phẩm vào giỏ hàng
export const addToCartSchema = Joi.object({
  productId: Joi.objectId().required().messages({
    "any.required": "Thiếu productId",
    "string.pattern.name": "productId không hợp lệ",
  }),
  variantId: Joi.objectId().required().messages({
    "any.required": "Thiếu variantId",
    "string.pattern.name": "variantId không hợp lệ",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "Thiếu quantity",
    "number.base": "Số lượng phải là số",
    "number.min": "Số lượng phải lớn hơn 0",
  }),
});

// ✅ Validate khi cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "Thiếu quantity",
    "number.base": "Số lượng phải là số",
    "number.min": "Số lượng phải lớn hơn 0",
  }),
});
