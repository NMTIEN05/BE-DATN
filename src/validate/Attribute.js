import Joi from "joi";

// ✅ Schema tạo Attribute
export const createAttributeSchema = Joi.object({
  name: Joi.string().required(),
  attributeCode: Joi.string().required(),
  slug: Joi.string().required(),

  values: Joi.array().items(Joi.string()).default([]),
  description: Joi.string().allow("").default(""),

  seoTitle: Joi.string().allow("").default(""),
  seoDescription: Joi.string().allow("").default(""),
  tags: Joi.array().items(Joi.string()).default([]),
});

// ✅ Schema cập nhật Attribute
export const updateAttributeSchema = Joi.object({
  name: Joi.string(),
  attributeCode: Joi.string(),
  slug: Joi.string(),

  values: Joi.array().items(Joi.string()),
  description: Joi.string().allow(""),

  seoTitle: Joi.string().allow(""),
  seoDescription: Joi.string().allow(""),
  tags: Joi.array().items(Joi.string()),
}).min(1); // Cập nhật ít nhất 1 trường
