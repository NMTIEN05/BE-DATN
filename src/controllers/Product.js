import Product from "../model/Product.js";
import Variant from "../model/Variant.js";
import { productSchema } from "../validate/Product.js";

import mongoose from "mongoose";

export const getAllProducts = async (req, res) => {
  try {
    let {
      offset = "0",
      limit = "5",
      sortBy = "createdAt",
      order = "desc",
      groupId,
      categoryId,
      search,
      deleted,
      minPrice,
      maxPrice
    } = req.query;

    const offsetNumber = parseInt(offset, 10);
    const limitNumber = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    // Khởi tạo filter
    const filter = {};

    // ⚠️ Lọc sản phẩm đã xoá hay chưa
    if (deleted === "true") {
      filter.deletedAt = { $ne: null };
    } else {
      filter.deletedAt = null;
    }

    // 🔍 Lọc theo group
    if (groupId) filter.groupId = groupId;

    // 🔍 Lọc theo category
    if (categoryId) filter.categoryId = categoryId;

    // 🔍 Lọc theo tên (search title)
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    // 💰 Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      filter.priceDefault = {};
      if (minPrice) filter.priceDefault.$gte = Number(minPrice);
      if (maxPrice) filter.priceDefault.$lte = Number(maxPrice);
    }

    // Truy vấn sản phẩm
    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(offsetNumber)
      .limit(limitNumber)
      .populate("categoryId")
      .populate("groupId")
      .populate({
        path: "variants",
        match: { deletedAt: null },
        populate: {
          path: "attributes.attributeId attributes.attributeValueId",
        },
      });

    // Tổng số lượng sản phẩm để phân trang
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        offset: offsetNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy danh sách sản phẩm",
      error: error.message,
    });
  }
};




// [GET] /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId")
      .populate("groupId")
      .populate({
        path: "variants",
       match: { deletedAt: null },
        populate: {
          path: "attributes.attributeId attributes.attributeValueId",
        },
      });

    if (!product || product.deletedAt) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm", error });
  }
};
export const createProduct = async (req, res) => {
  try {
    // ✅ Validate dữ liệu
    const { error } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: error.details.map((err) => err.message),
      });
    }

    const product = new Product(req.body);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Tạo sản phẩm thất bại", error });
  }
};
export const updateProduct = async (req, res) => {
  try {
    // ✅ Validate dữ liệu
    const { error } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: error.details.map((err) => err.message),
      });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("categoryId")
      .populate("groupId")
      .populate({
        path: "variants",
        populate: {
          path: "attributes.attributeId attributes.attributeValueId",
        },
      });

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Cập nhật sản phẩm thất bại", error });
  }
};
// [DELETE] /api/products/:id (soft delete)
export const deleteProduct = async (req,res) => {
  try {
    const deleted = await Product.findByIdAndUpdate(
      req.params.id,
      {
        deletedAt: new Date(),
        deletedBy: req.body.deletedBy || null,
      },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({ message: "Đã xoá sản phẩm (soft delete)" });
  } catch (error) {
    res.status(500).json({ message: "Xoá sản phẩm thất bại", error });
  }
};
export const hardDeleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({ message: "Đã xoá sản phẩm vĩnh viễn (hard delete)" });
  } catch (error) {
    res.status(500).json({ message: "Xoá cứng thất bại", error });
  }
};
// [DELETE] /api/product/hard-all
// export const hardDeleteAllProducts = async (req, res) => {
//   try {
//     const result = await Product.deleteMany({ deletedAt: { $ne: null } });

//     res.json({
//       message: "Đã xoá tất cả sản phẩm bị xoá mềm",
//       deletedCount: result.deletedCount,
//     });
//   } catch (error) {
//     console.error("❌ Lỗi xoá all:", error);
//     res.status(500).json({ message: "Lỗi xoá tất cả sản phẩm đã xoá", error });
//   }
// };
export const restoreProduct = async (req, res) => {
  try {
    const restored = await Product.findByIdAndUpdate(
      req.params.id,
      { deletedAt: null, deletedBy: null },
      { new: true }
    );

    if (!restored) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({ message: "Khôi phục sản phẩm thành công", data: restored });
  } catch (error) {
    res.status(500).json({ message: "Khôi phục thất bại", error });
  }
};


// [GET] /api/products/group/:groupId
export const getProductsByGroup = async (req,res) => {
  try {
    const products = await Product.find({
      groupId: req.params.groupId,
      deletedAt: null,
    }).sort({ priceDefault: 1 }); // hoặc sort theo hứ tự tăng dần
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm theo group", error });
  }
};
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("categoryId")
      .populate("groupId")
      .populate({
        path: "variants",
        populate: {
          path: "attributes.attributeId attributes.attributeValueId",
        },
      });

    if (!product || product.deletedAt) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm", error });
  }
};
export const getVariantsByProductId = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("👉 Nhận được productId:", productId);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const variants = await Variant.find({ productId })
      .populate("attributes.attributeId")
      .populate("attributes.attributeValueId");

    console.log("✅ Số biến thể tìm được:", variants.length);
    res.json(variants);
  } catch (err) {
    console.error("❌ Lỗi khi truy vấn biến thể:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message || err });
  }
};



// [GET] /api/products/category/:categoryId
export const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const products = await Product.find({
      categoryId,
      deletedAt: null
    })
      .sort({ createdAt: -1 }) // hoặc sort theo tiêu chí khác nếu muốn
      .populate("categoryId")
      .populate("groupId")
      .populate({
        path: "variants",
        match: { deletedAt: null },
        populate: {
          path: "attributes.attributeId attributes.attributeValueId",
        },
      });

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm theo danh mục", error });
  }
};
