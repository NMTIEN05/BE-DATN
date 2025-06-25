import ProductGroup from "../model/ProductGroup.js ";
import Product from "../model/Product.js";
import mongoose from "mongoose";


// GET: Lấy tất cả nhóm
export const getAllProductGroups = async (req,res) => {
  try {
    const groups = await ProductGroup.find({ deletedAt: null });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách", error: err });
  }
};
// GET: Lấy 1 nhóm theo slug
export const getProductGroupBySlug = async (req,res) => {
  try {
    const group = await ProductGroup.findOne({ slug: req.params.slug });
    if (!group) return res.status(404).json({ message: "Không tìm thấy nhóm" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Lỗi", error: err });
  }
};
// POST: Tạo nhóm mới
export const createProductGroup = async (req,res) => {
  try {
    const newGroup = new ProductGroup(req.body);
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(400).json({ message: "Lỗi tạo nhóm", error: err });
  }
};
// PUT: Cập nhật nhóm
export const updateProductGroup = async (req,res) => {
  try {
    const updated = await ProductGroup.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Lỗi cập nhật", error: err });
  }
};
// DELETE: Xoá mềm
export const deleteProductGroup = async (req,res) => {
  try {
    await ProductGroup.findByIdAndUpdate(req.params.id, {
      deletedAt: new Date(),
    });
    res.json({ message: "Đã xoá nhóm sản phẩm (mềm)" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá", error: err });
  }
};
export const getProductsByGroupId = async (req, res) => {
  try {
    const groupId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "groupId không hợp lệ" });
    }

    const products = await Product.find({ groupId, deletedAt: null }) // lọc xóa mềm nếu có
      .populate("groupId")
      .populate("categoryId");

    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi khi lấy sản phẩm theo group:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
