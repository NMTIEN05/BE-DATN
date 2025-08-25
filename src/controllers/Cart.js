import mongoose from "mongoose";
import Cart from "../model/Cart.js";
import CartItem from "../model/CartItem.js";
import Variant from "../model/Variant.js";
import User from "../model/User.js";
import FlashSale from "../model/flashSale.js";
import { addToCartSchema, updateCartItemSchema } from "../validate/Cart.js";
import Product from "../model/Product.js";

// ✅ Thêm sản phẩm vào giỏ
export const addToCart = async (req, res) => {
  try {
    // Validate request
    const { error } = addToCartSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ message: "Thiếu thông tin người dùng" });

    const { productId, variantId, quantity } = req.body;

    // Lấy hoặc tạo cart
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId: new mongoose.Types.ObjectId(userId) });

    // Lấy variant và populate AttributeValue
    const variant = await Variant.findById(variantId).populate({
      path: "attributes.attributeValueId",
      select: "value",
    });
    if (!variant) return res.status(404).json({ message: "Không tìm thấy biến thể" });

    // Lấy flash sale hiện tại nếu có
    const now = new Date();
    let flashSale = await FlashSale.findOne({
      product: productId,
      variant: variantId,
      startTime: { $lte: now },
      endTime: { $gte: now },
      isActive: true,
    });

    // Kiểm tra số lượng flash sale còn lại
    if (flashSale && flashSale.soldQuantity >= flashSale.quantity) {
      flashSale = null;
    }

    // Giá áp dụng
    const priceToUse = flashSale ? flashSale.salePrice : variant.price;
    const originalPrice = variant.price; // giá gốc luôn là giá variant ban đầu

    // Tìm item trong cart
    let cartItem = await CartItem.findOne({ cartId: cart._id, productId, variantId });

    if (cartItem) {
      // Kiểm tra tồn kho
      if (cartItem.quantity + quantity > variant.stock) {
        return res.status(400).json({
          message: `Số lượng vượt quá tồn kho. Chỉ còn lại ${variant.stock - cartItem.quantity} sản phẩm.`,
        });
      }
      cartItem.quantity += quantity;
      cartItem.price = priceToUse; 
      cartItem.originalPrice = originalPrice;
      await cartItem.save();
    } else {
      if (quantity > variant.stock) {
        return res.status(400).json({
          message: `Số lượng vượt quá tồn kho. Chỉ còn lại ${variant.stock} sản phẩm.`,
        });
      }
      cartItem = await CartItem.create({
        cartId: cart._id,
        productId,
        variantId,
        quantity,
        price: priceToUse,
        originalPrice,
      });
    }

    // Lấy tên sản phẩm từ Product
    const product = await Product.findById(productId).select("title name");
    const variantNameFromAttr =
      variant.attributes?.[0]?.attributeValueId?.value || variant.name || "Tên biến thể";

    // Trả về object đầy đủ cho frontend
    res.status(200).json({
      _id: cartItem._id,
      productId,
      productTitle: product?.title ?? product?.name ?? "Tên sản phẩm",
      variantId,
      variantName: variantNameFromAttr,
      quantity: cartItem.quantity,
      price: priceToUse,
      originalPrice, // giá gốc để frontend tính khuyến mãi
      flashSale: !!flashSale,
      flashSalePrice: flashSale?.salePrice ?? null,
      discountPercent: flashSale?.discountPercent ?? 0,
      flashSaleStart: flashSale?.startTime ?? null,
      flashSaleEnd: flashSale?.endTime ?? null,
    });
  } catch (err) {
    console.error("Lỗi addToCart:", err);
    res.status(500).json({ message: "Lỗi thêm vào giỏ", error: err.message });
  }
};




// ✅ Lấy giỏ hàng của người dùng
export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ message: "Thiếu thông tin người dùng" });

    // Lấy cart theo user
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json([]); // chưa có cart → trả về mảng rỗng

    // Lấy tất cả CartItem của cart, populate product và variant
    let items = await CartItem.find({ cartId: cart._id })
      .populate("productId") // populate product
      .populate({
        path: "variantId",
        populate: [
          { path: "attributes.attributeId", model: "Attribute" },
          { path: "attributes.attributeValueId", model: "AttributeValue" },
        ],
      });

    // Map lại để tính giá hiển thị: flashSale > variant.price > item.price
    items = items.map((item) => {
      const obj = item.toObject();

      // Giá hiển thị ưu tiên flash sale
      obj.price = item.flashSaleApplied && item.flashSalePrice ? item.flashSalePrice : item.price;

      // Tên sản phẩm + tên biến thể
      obj.productTitle = obj.productId?.title || obj.productId?.name || "Sản phẩm";
      obj.variantName =
        obj.variantId?.attributes?.[0]?.attributeValueId?.value || obj.variantId?.name || "Tên biến thể";

      return obj;
    });

    res.json(items);
  } catch (err) {
    console.error("❌ Lỗi getCart:", err);
    res.status(500).json({ message: "Lỗi lấy giỏ hàng", error: err.message });
  }
};



// ✅ Cập nhật số lượng sản phẩm trong giỏ
export const updateCartItem = async (req, res) => {
  try {
    const { error } = updateCartItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.user?.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

    const item = await CartItem.findOneAndUpdate(
      { _id: itemId, cartId: cart._id },
      { quantity },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
};

// ✅ Xoá 1 item trong giỏ
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

    const deleted = await CartItem.findOneAndDelete({ _id: itemId, cartId: cart._id });
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm để xoá" });

    res.json({ message: "Xoá thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá", error: err.message });
  }
};

// ✅ Xoá toàn bộ giỏ hàng
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

    await CartItem.deleteMany({ cartId: cart._id });

    res.json({ message: "Đã xoá toàn bộ giỏ hàng" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá giỏ hàng", error: err.message });
  }
};

// ✅ Lấy thông tin cart item kèm user
export const getCartItemWithUser = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await CartItem.findById(itemId)
      .populate("productId")
      .populate("variantId");

    if (!item) return res.status(404).json({ message: "Không tìm thấy item" });

    const cart = await Cart.findById(item.cartId).populate({ path: "userId", model: "UserModel" });

    res.json({
      ...item.toObject(),
      user: cart?.userId || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
