
import AttributeValue from "../model/AttributeValue.js";

// [GET] /api/attribute-values
export const getAllAttributeValues = async (req,res) => {
  try {
    const values = await AttributeValue.find({ deletedAt: null }).populate("attributeId");
    res.json(values);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách giá trị thuộc tính", error });
  }
};

// [GET] /api/attribute-values/:id
export const getAttributeValueById = async (req, res) => {
  try {
    const { id } = req.params;
    const attrValue = await AttributeValue.findById(id);
    if (!attrValue) {
      return res.status(404).json({ message: "Không tìm thấy màu sắc" });
    }
    res.json(attrValue);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", err });
  }
};

// [POST] /api/attribute-values
export const createAttributeValue = async (req,res) => {
  try {
    const value = new AttributeValue(req.body);
    const saved = await value.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Tạo giá trị thuộc tính thất bại", error });
  }
};

// [PUT] /api/attribute-values/:id
export const updateAttributeValue = async (req,res) => {
  try {
    const updated = await AttributeValue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy giá trị thuộc tính" });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Cập nhật thất bại", error });
  }
};

// [DELETE] /api/attribute-values/:id
export const deleteAttributeValue = async (req,res) => {
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
      return res.status(404).json({ message: "Không tìm thấy giá trị thuộc tính" });
    }
    res.json({ message: "Đã xoá giá trị thuộc tính (soft delete)" });
  } catch (error) {
    res.status(500).json({ message: "Xoá thất bại", error });
  }
};
