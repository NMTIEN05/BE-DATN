import Joi from "joi";

// Schema validate user (tạo hoặc cập nhật)
export const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Tên đăng nhập không được để trống",
    "string.min": "Tên đăng nhập phải có ít nhất 3 ký tự",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Mật khẩu không được để trống",
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email không được để trống",
    "string.email": "Email không hợp lệ",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{9,11}$/)
    .required()
    .messages({
      "string.empty": "Số điện thoại không được để trống",
      "string.pattern.base": "Số điện thoại không hợp lệ",
    }),
  full_name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Họ tên không được để trống",
    "string.min": "Họ tên phải có ít nhất 2 ký tự",
  }),
  role: Joi.string()
    .valid("user", "admin", "staff")
    .default("user")
    .messages({
      "any.only": "Vai trò không hợp lệ (phải là admin, user hoặc staff)",
    }),
  isActive: Joi.boolean().default(true),
});

// Schema validate cập nhật user
export const updateUserSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[0-9]{9,11}$/).optional().messages({
    "string.pattern.base": "Số điện thoại không hợp lệ",
  }),
  address: Joi.string().allow("").max(255).optional(),
  role: Joi.string().valid("admin", "staff", "user").optional(),
  isActive: Joi.boolean().optional(),
});

// Schema validate đổi mật khẩu
export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "string.empty": "Mật khẩu cũ không được để trống",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu mới phải có ít nhất 6 ký tự",
    "string.empty": "Mật khẩu mới không được để trống",
  }),
});
