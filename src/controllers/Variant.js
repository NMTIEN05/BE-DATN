
  import Variant from "../model/Variant.js";
  import Product from "../model/Product.js";

  import Attribute from "../model/Attribute.js";
  import AttributeValue from "../model/AttributeValue.js";
  import { variantSchema } from "../validate/Variant.js"; // ✅ Thêm dòng này
  import mongoose from "mongoose";

  // [GET] /api/variants
  export const getAllVariants = async (req, res) => {
    try {
      let {
        offset = "0",
        limit = "10",
        sortBy = "createdAt",
        order = "desc",
        productId,
        search,
      } = req.query;

      const offsetNumber = parseInt(offset, 10);
      const limitNumber = parseInt(limit, 10);
      const sortOrder = order === "desc" ? -1 : 1;

      // Điều kiện lọc
      const filter = { deletedAt: null };
      if (productId) filter.productId = productId;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { sku: { $regex: search, $options: "i" } },
        ];
      }

      // Truy vấn
      const variants = await Variant.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(offsetNumber)
        .limit(limitNumber)
        .populate("productId")
        .populate("attributes.attributeId")
        .populate("attributes.attributeValueId");

      const total = await Variant.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: variants,
        pagination: {
          total,
          offset: offsetNumber,
          limit: limitNumber,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi lấy danh sách biến thể",
        error: error.message,
      });
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

    // Chuyển từ { attributeName, value } => ID
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

    // Nếu không có ảnh, lấy từ ảnh màu
    if (!imageUrl || imageUrl.length === 0) {
      const colorAttr = await Promise.all(
        finalAttributes.map(async (att) => {
          const attr = await Attribute.findById(att.attributeId);
          return attr?.name === "Màu sắc" ? att : null;
        })
      );

      const validColorAttr = colorAttr.find((c) => c);
      if (validColorAttr) {
        const colorValue = await AttributeValue.findById(validColorAttr.attributeValueId);
        if (colorValue?.imageUrl) {
          imageUrl = [colorValue.imageUrl];
        }
      }
    }

    // ✅ Validate với Joi
    const { error } = variantSchema.validate({
      name,
      imageUrl,
      productId,
      price,
      oldPrice,
      stock,
      attributes: finalAttributes,
    });

    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: error.details.map((err) => err.message),
      });
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

    // 👉 Gắn vào product
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

