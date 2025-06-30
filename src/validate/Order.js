import Joi from "joi";
import joiObjectId from "joi-objectid";

Joi.objectId = joiObjectId(Joi);

// ✅ Chỉ validate các trường do client gửi lên
export const orderSchema = Joi.object({
  shippingAddress: Joi.string().min(5).required().messages({
    "string.empty": "Địa chỉ giao hàng không được để trống",
    "string.min": "Địa chỉ phải có ít nhất 5 ký tự",
    "any.required": "Trường địa chỉ là bắt buộc",
  }),

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
    "any.required": "Trường tổng tiền là bắt buộc",
  }),

  // Các field dưới sẽ được backend tự xử lý => không validate ở đây
});
