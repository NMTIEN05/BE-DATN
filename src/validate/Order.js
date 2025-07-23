import Joi from "joi";
import joiObjectId from "joi-objectid";

Joi.objectId = joiObjectId(Joi); // thêm hàm validate ObjectId

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

  items: Joi.array().items(
    Joi.object({
      productId: Joi.objectId().required().messages({
        "any.required": "Thiếu productId trong sản phẩm",
      }),
      variantId: Joi.objectId().required().messages({
        "any.required": "Thiếu variantId trong sản phẩm",
      }),
      quantity: Joi.number().min(1).required().messages({
        "number.min": "Số lượng phải lớn hơn 0",
        "any.required": "Số lượng là bắt buộc",
      }),
      price: Joi.number().min(0).required().messages({
        "number.min": "Giá tiền phải lớn hơn hoặc bằng 0",
        "any.required": "Giá tiền là bắt buộc",
      }),
      name: Joi.string().required().messages({
        "any.required": "Tên sản phẩm là bắt buộc",
      }),
      image: Joi.string().uri().allow("").messages({
        "string.uri": "Link ảnh không hợp lệ",
      }),
    })
  ).min(1).required().messages({
    "array.base": "Danh sách sản phẩm phải là mảng",
    "array.min": "Phải có ít nhất 1 sản phẩm",
    "any.required": "Danh sách sản phẩm là bắt buộc",
  }),

  userId: Joi.objectId().optional(), // dùng khi không xác thực req.user
});
