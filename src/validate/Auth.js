// auth.js
import Joi from "joi";

// Schema validate đăng ký
export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Tên đăng nhập không được để trống",
    "string.min": "Tên đăng nhập phải có ít nhất 3 ký tự",
  }),
  full_name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Họ tên không được để trống",
    "string.min": "Họ tên phải có ít nhất 2 ký tự",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "string.empty": "Email không được để trống",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "string.empty": "Mật khẩu không được để trống",
  }),
phone: Joi.string()
  .pattern(/^0\d{9}$/)
  .allow("")
  .optional()
  .messages({
    "string.pattern.base": "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số",
  }),

    address: Joi.string().min(5).messages({
    "string.min": "Địa chỉ phải có ít nhất 5 ký tự nếu nhập",
  }),
  province: Joi.string().allow("").optional(),
  district: Joi.string().allow("").optional(),
  ward: Joi.string().allow("").optional(),
  role: Joi.string().valid("user", "admin", "staff").default("user"),
});

// Schema validate đăng nhập
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "string.empty": "Email không được để trống",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "string.empty": "Mật khẩu không được để trống",
  }),
});
