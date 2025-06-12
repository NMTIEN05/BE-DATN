import Joi from "joi";

export const capacitySchema = Joi.object({
  capacity: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Dung lượng không được để trống.",
      "any.required": "Trường dung lượng là bắt buộc.",
    }),
});
