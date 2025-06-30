import Attribute from "../model/Attribute.js";
import {
  createAttributeSchema,
  updateAttributeSchema,
} from "../validate/Attribute.js";

// GET all attributes
export const getAllAttributes = async (req, res) => {
  try {
    let {
      offset = "0",
      limit = "10",
      sortBy = "createdAt",
      order = "desc",
      search,
    } = req.query;

    const offsetNumber = parseInt(offset, 10);
    const limitNumber = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    const filter = { deletedAt: null };
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const attributes = await Attribute.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(offsetNumber)
      .limit(limitNumber);

    const total = await Attribute.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: attributes,
      pagination: {
        total,
        offset: offsetNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách thuộc tính",
      error: error.message,
    });
  }
};

// GET one attribute by ID
export const getAttributeById = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);
    if (!attribute || attribute.deletedAt) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thuộc tính" });
    }
    res.json({ success: true, data: attribute });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy thuộc tính", error: error.message });
  }
};

// CREATE new attribute
export const createAttribute = async (req, res) => {
  try {
    const { error } = createAttributeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const attribute = new Attribute(req.body);
    const saved = await attribute.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Tạo thuộc tính thất bại",
      error: error.message,
    });
  }
};

// UPDATE attribute
export const updateAttribute = async (req, res) => {
  try {
    const { error } = updateAttributeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const updated = await Attribute.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thuộc tính" });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: "Cập nhật thất bại", error: error.message });
  }
};

// DELETE (soft delete)
export const deleteAttribute = async (req, res) => {
  try {
    const deleted = await Attribute.findByIdAndUpdate(
      req.params.id,
      {
        deletedAt: new Date(),
        deletedBy: req.body.deletedBy || null,
      },
      { new: true }
    );
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thuộc tính" });
    }
    res.json({ success: true, message: "Đã xoá thuộc tính (soft delete)" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Xoá thất bại", error: error.message });
  }
};
