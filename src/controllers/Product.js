import Product from "../model/Product.js";
import Variant from "../model/Variant.js";
import mongoose from "mongoose";


// [GET] /api/products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ deletedAt: null })
      .populate("categoryId")
      .populate("groupId")
      .populate({
        path: "variants",
        match: { deletedAt: null }, // ✅ CHỈ LẤY BIẾN THỂ CHƯA XOÁ
        populate: {
          path: "attributes.attributeId attributes.attributeValueId",
        },
      });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm", error });
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



// [POST] /api/products
export const createProduct = async (req,res) => {
  try {
    const { title, slug, priceDefault, groupId, categoryId  } = req.body;

    // ✅ Validate đơn giản
    if (!title || !slug || !priceDefault || !groupId || !categoryId) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const product = new Product(req.body);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Tạo sản phẩm thất bại", error });
  }
};

// [PUT] /api/products/:id
export const updateProduct = async (req,res) => {
  try {
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



