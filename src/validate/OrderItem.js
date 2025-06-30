import Joi from "joi";
import joiObjectId from "joi-objectid";

Joi.objectId = joiObjectId(Joi);

// Validate query (getAll)
export const orderItemQuerySchema = Joi.object({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(1).max(100).default(10),
  sortBy: Joi.string().valid("createdAt", "updatedAt", "price", "quantity").default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
  orderId: Joi.objectId().optional(),
  productId: Joi.objectId().optional(),
  variantId: Joi.objectId().optional(),
});

// Validate :id param
export const orderItemIdParamSchema = Joi.object({
  id: Joi.objectId().required().messages({
    "any.required": "Thiếu ID OrderItem",
    "string.pattern.name": "ID không hợp lệ",
  }),
});

// Validate :orderId param
export const orderItemByOrderIdSchema = Joi.object({
  orderId: Joi.objectId().required().messages({
    "any.required": "Thiếu orderId",
    "string.pattern.name": "orderId không hợp lệ",
  }),
});
