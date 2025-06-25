
import Variant from "../model/Variant.js";
import Product from "../model/Product.js";

import Attribute from "../model/Attribute.js";
import AttributeValue from "../model/AttributeValue.js";
import mongoose from "mongoose";

// [GET] /api/variants
export const getAllVariants = async (req,res) => {
  try {
    const variants = await Variant.find({ deletedAt: null })
        .populate("productId")
  .populate("attributes.attributeId")
  .populate("attributes.attributeValueId");

    res.json(variants);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách biến thể", error });
  }
};

export const getVariantById = async (req, res) => {
  try {
    const variantId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const variant = await Variant.findById(variantId)
      .populate("attributes.attributeId")
      .populate("attributes.attributeValueId")
      .populate("productId"); // Nếu muốn lấy thêm thông tin sản phẩm

    if (!variant) {
      return res.status(404).json({ message: "Không tìm thấy biến thể" });
    }

    res.json(variant);
  } catch (err) {
    console.error("❌ Lỗi khi lấy biến thể:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
export const getVariantsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ProductId không hợp lệ" });
    }

    const variants = await Variant.find({ productId, deletedAt: null }) // lọc cả biến thể chưa bị xóa mềm
      .populate("attributes.attributeId")
      .populate("attributes.attributeValueId");

    res.json(variants);
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách biến thể:", error);
    res.status(500).json({ message: "Lỗi lấy danh sách biến thể", error });
  }
};
// [POST] /api/variants
export const createVariant = async (req, res) => {
  try {
    let {
      name,
      imageUrl,
      productId,
      price,
      stock = 0,
      oldPrice = null,
      attributes = [],
    } = req.body;

    const finalAttributes = [];

    // ✅ Chuyển attributes dạng { attributeName, value } thành đúng ID
    for (const attr of attributes) {
      if (attr.attributeId && attr.attributeValueId) {
        finalAttributes.push(attr);
        continue;
      }

      const attribute = await Attribute.findOne({ name: attr.attributeName });
      if (!attribute) {
        return res.status(400).json({ message: `Thuộc tính '${attr.attributeName}' không tồn tại.` });
      }

      let value = await AttributeValue.findOne({
        value: attr.value,
        attributeId: attribute._id,
      });

      if (!value) {
        value = await AttributeValue.create({
          value: attr.value,
          attributeId: attribute._id,
        });
      }

      finalAttributes.push({
        attributeId: attribute._id,
        attributeValueId: value._id,
      });
    }

    // ✅ Nếu chưa có ảnh, thử lấy ảnh từ màu
    if (!imageUrl || imageUrl.length === 0) {
      const colorAttr = finalAttributes.find(async (att) => {
        const attribute = await Attribute.findById(att.attributeId);
        return attribute?.name === "Màu sắc";
      });

      if (colorAttr) {
        const colorValue = await AttributeValue.findById(colorAttr.attributeValueId);
        if (colorValue?.imageUrl) {
          imageUrl = [colorValue.imageUrl];
        }
      }
    }

    const variant = new Variant({
      name,
      imageUrl,
      productId,
      price,
      oldPrice,
      stock,
      attributes: finalAttributes,
    });

    const saved = await variant.save();

    // 👉 Gắn vào sản phẩm
    await Product.findByIdAndUpdate(productId, {
      $push: { variants: saved._id },
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Lỗi tạo biến thể:", err);
    res.status(400).json({ message: "Lỗi khi tạo biến thể", error: err.message });
  }
};
// [PUT] /api/variants/:id
export const updateVariant = async (req,res) => {
  try {
    const updated = await Variant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy biến thể" });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Cập nhật thất bại", error });
  }
};

// [DELETE] /api/variants/:id (soft delete)
export const deleteVariant = async (req, res) => {
  const variantId = req.params.id;

  try {
    // Lấy biến thể cần xoá
    const variant = await Variant.findById(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Không tìm thấy biến thể" });
    }

    // Đếm số lượng biến thể còn lại (chưa xoá) của sản phẩm
    const activeVariantsCount = await Variant.countDocuments({
      productId: variant.productId,
      deletedAt: null,
    });

    // Nếu chỉ còn 1 thì không cho xoá
    if (activeVariantsCount <= 1) {
      return res.status(400).json({
        message: "Sản phẩm phải có ít nhất 1 biến thể. Không thể xoá biến thể cuối cùng.",
      });
    }

    // Xoá mềm
    const deleted = await Variant.findByIdAndUpdate(
      variantId,
      { deletedAt: new Date() },
      { new: true }
    );

    res.json({ message: "Đã xoá biến thể (soft delete)", deleted });
  } catch (error) {
    console.error("❌ Lỗi xoá biến thể:", error);
    res.status(500).json({ message: "Xoá thất bại", error });
  }
};


export const getVariantDetailById = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    // Kiểm tra ObjectId hợp lệ
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(variantId)
    ) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const variant = await Variant.findOne({
      _id: variantId,
      productId,
      deletedAt: null,
    })
      .populate("attributes.attributeId")
      .populate("attributes.attributeValueId");

    if (!variant) {
      return res.status(404).json({ message: "Không tìm thấy biến thể" });
    }

    res.json(variant);
  } catch (err) {
    console.error("❌ Lỗi khi lấy biến thể chi tiết:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

