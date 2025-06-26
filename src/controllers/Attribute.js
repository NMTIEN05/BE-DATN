
import Attribute from "../model/Attribute.js";

// GET all attributes
export const getAllAttributes = async (req,res) => {
  try {
    const attributes = await Attribute.find({ deletedAt: null });
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách thuộc tính", error });
  }
};

// GET one attribute by ID
export const getAttributeById = async (req,res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);
    if (!attribute || attribute.deletedAt) {
      return res.status(404).json({ message: "Không tìm thấy thuộc tính" });
    }
    res.json(attribute);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy thuộc tính", error });
  }
};

// CREATE new attribute
export const createAttribute = async (req,res) => {
  try {
    const attribute = new Attribute(req.body);
    const saved = await attribute.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Tạo thuộc tính thất bại", error });
  }
};

// UPDATE attribute
export const updateAttribute = async (req,res) => {
  try {
    const updated = await Attribute.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy thuộc tính" });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Cập nhật thất bại", error });
  }
};

// DELETE (soft delete)
export const deleteAttribute = async (req,res) => {
  try {
    const deleted = await Attribute.findByIdAndUpdate(
      req.params.id,
      {
        deletedAt: new Date(),
        deletedBy: req.body.deletedBy || null, // gửi ID người xóa nếu có
      },
      { new: true }
    );
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy thuộc tính" });
    }
    res.json({ message: "Đã xoá thuộc tính (soft delete)" });
  } catch (error) {
    res.status(500).json({ message: "Xoá thất bại", error });
  }
};
