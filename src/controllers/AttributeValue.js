import AttributeValue from "../model/AttributeValue.js";
import {
  createAttributeValueSchema,
  updateAttributeValueSchema,
} from "../validate/AttributeValue.js";

// [GET] /api/attribute-values
export const getAllAttributeValues = async (req, res) => {
  try {
    let {
      offset = "0",
      limit = "10",
      sortBy = "createdAt",
      order = "desc",
      attributeId,
      search,
    } = req.query;

    const offsetNumber = parseInt(offset, 10);
    const limitNumber = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    const filter = { deletedAt: null };
    if (attributeId) filter.attributeId = attributeId;
    if (search) {
      filter.value = { $regex: search, $options: "i" };
    }

    const values = await AttributeValue.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(offsetNumber)
      .limit(limitNumber)
      .populate("attributeId");

    const total = await AttributeValue.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: values,
      pagination: {
        total,
        offset: offsetNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách giá trị thuộc tính",
      error: error.message,
    });
  }
};

// [GET] /api/attribute-values/:id
export const getAttributeValueById = async (req, res) => {
  try {
    const { id } = req.params;
    const attrValue = await AttributeValue.findById(id).populate("attributeId");

    if (!attrValue || attrValue.deletedAt) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giá trị thuộc tính" });
    }

    res.json({ success: true, data: attrValue });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// [POST] /api/attribute-values
export const createAttributeValue = async (req, res) => {
  try {
    const { error } = createAttributeValueSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const value = new AttributeValue(req.body);
    const saved = await value.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Tạo giá trị thuộc tính thất bại",
      error: error.message,
    });
  }
};

// [PUT] /api/attribute-values/:id
export const updateAttributeValue = async (req, res) => {
  try {
    const { error } = updateAttributeValueSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const updated = await AttributeValue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giá trị thuộc tính" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Cập nhật thất bại",
      error: error.message,
    });
  }
};

// [DELETE] /api/attribute-values/:id
export const deleteAttributeValue = async (req, res) => {
  try {
    const deleted = await AttributeValue.findByIdAndUpdate(
      req.params.id,
      {
        deletedAt: new Date(),
        deletedBy: req.body.deletedBy || null,
      },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giá trị thuộc tính" });
    }

    res.json({ success: true, message: "Đã xoá giá trị thuộc tính (soft delete)" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Xoá thất bại",
      error: error.message,
    });
  }
};
