import Joi from "joi";
import joiObjectId from "joi-objectid";

Joi.objectId = joiObjectId(Joi);

export const orderSchema = Joi.object({
  shippingInfo: Joi.object({
    fullName: Joi.string().required().messages({
      "string.empty": "Vui lòng nhập họ tên người nhận",
      "any.required": "Họ tên người nhận là bắt buộc"
    }),
    phone: Joi.string().required().messages({
      "string.empty": "Vui lòng nhập số điện thoại",
      "any.required": "Số điện thoại là bắt buộc"
    }),
    address: Joi.string().min(5).required().messages({
      "string.empty": "Vui lòng nhập địa chỉ",
      "string.min": "Địa chỉ phải có ít nhất 5 ký tự",
      "any.required": "Địa chỉ là bắt buộc"
    }),
  }).required(),

  paymentMethod: Joi.string()
    .valid("COD", "VNPay", "Stripe", "Momo")
    .default("COD")
    .required()
    .messages({
      "any.only": "Phương thức thanh toán không hợp lệ",
      "any.required": "Phương thức thanh toán là bắt buộc",
    }),

  totalAmount: Joi.number().min(0).required().messages({
    "number.base": "Tổng tiền phải là số",
    "number.min": "Tổng tiền không được âm",
    "any.required": "Tổng tiền là bắt buộc",
  }),
});
