import ProductGroup from "../model/ProductGroup.js";
import Product from "../model/Product.js";
import mongoose from "mongoose";
import { productGroupSchema } from "../validate/ProductGroup.js";

// [GET] Lấy tất cả nhóm sản phẩm
export const getAllProductGroups = async (req, res) => {
  try {
    let {
      offset = "0",
      limit = "10",
      sortBy = "createdAt",
      order = "desc",
      categoryId,
      search,
    } = req.query;

    const offsetNumber = parseInt(offset, 10);
    const limitNumber = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    // Tạo điều kiện lọc
    const filter = { deletedAt: null };
    if (categoryId) filter.categoryId = categoryId;
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // tìm gần đúng
    }

    // Query dữ liệu
    const groups = await ProductGroup.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(offsetNumber)
      .limit(limitNumber)
      .populate("categoryId");

    const total = await ProductGroup.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: groups,
      pagination: {
        total,
        offset: offsetNumber,
        limit: limitNumber,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi lấy danh sách nhóm sản phẩm",
      error: err.message,
    });
  }
};

// [GET] Lấy nhóm theo ID
export const getProductGroupById = async (req, res) => {
  try {
    const group = await ProductGroup.findById(req.params.id).populate("categoryId");
    if (!group) return res.status(404).json({ message: "Không tìm thấy nhóm sản phẩm" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy nhóm sản phẩm", error: err.message });
  }
};

// [GET] Lấy nhóm theo slug
export const getProductGroupBySlug = async (req, res) => {
  try {
    const group = await ProductGroup.findOne({ slug: req.params.slug }).populate("categoryId");
    if (!group) return res.status(404).json({ message: "Không tìm thấy nhóm" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Lỗi", error: err });
  }
};

// [POST] Tạo nhóm mới
export const createProductGroup = async (req, res) => {
  try {
    const { error } = productGroupSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: error.details.map((err) => err.message),
      });
    }

    const body = {
      ...req.body,
      imageUrl: Array.isArray(req.body.imageUrl) ? req.body.imageUrl : [req.body.imageUrl],
    };

    const newGroup = new ProductGroup(body);
    await newGroup.save();

    res.status(201).json(newGroup);
  } catch (err) {
    res.status(400).json({ message: "Lỗi tạo nhóm", error: err });
  }
};


// [PUT] Cập nhật nhóm
export const updateProductGroup = async (req, res) => {
  try {
    const { error } = productGroupSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: error.details.map((err) => err.message),
      });
    }

    const body = {
      ...req.body,
      imageUrl: Array.isArray(req.body.imageUrl) ? req.body.imageUrl : [req.body.imageUrl],
    };

    const updated = await ProductGroup.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    ).populate("categoryId");

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Lỗi cập nhật", error: err });
  }
};


// [DELETE] Xoá mềm nhóm
export const deleteProductGroup = async (req, res) => {
  try {
    await ProductGroup.findByIdAndUpdate(req.params.id, {
      deletedAt: new Date(),
    });
    res.json({ message: "Đã xoá nhóm sản phẩm (mềm)" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá", error: err });
  }
};

// [GET] Lấy tất cả sản phẩm thuộc 1 nhóm
export const getProductsByGroupId = async (req, res) => {
  try {
    const groupId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "groupId không hợp lệ" });
    }

    const products = await Product.find({ groupId, deletedAt: null })
      .populate({
        path: "groupId",
        populate: { path: "categoryId" },
      });

    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi khi lấy sản phẩm theo group:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
// controllers/ProductGroup.js

export const getDeletedProductGroups = async (req, res) => {
  try {
    const deletedGroups = await ProductGroup.find({ deletedAt: { $ne: null } }).populate("categoryId");
    res.json({ data: deletedGroups });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy nhóm sản phẩm", error: error.message });
  }
};

// ♻️ Khôi phục nhóm sản phẩm
export const restoreProductGroup = async (req, res) => {
  try {
    const group = await ProductGroup.findByIdAndUpdate(
      req.params.id,
      { deletedAt: null },
      { new: true }
    );
    if (!group) return res.status(404).json({ message: "Không tìm thấy nhóm" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi khôi phục", error: err.message });
  }
};

// 🗑️ Xoá cứng 1 nhóm
export const forceDeleteProductGroup = async (req, res) => {
  try {
    const deleted = await ProductGroup.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy nhóm" });
    res.json({ message: "Đã xoá vĩnh viễn" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá vĩnh viễn", error: err.message });
  }
};

// 🧹 Xoá tất cả nhóm đã xoá mềm
export const forceDeleteAllProductGroups = async (req, res) => {
  try {
    const result = await ProductGroup.deleteMany({ deletedAt: { $ne: null } });
    res.json({ message: `Đã xoá ${result.deletedCount} nhóm đã xoá mềm` });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá tất cả", error: err.message });
  }
};
