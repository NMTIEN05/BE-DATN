import mongoose from "mongoose";
import Cart from "../model/Cart.js";
import CartItem from "../model/CartItem.js";
import Variant from "../model/Variant.js";
import User from "../model/User.js";

import { addToCartSchema, updateCartItemSchema } from "../validate/Cart.js";

// ✅ Thêm sản phẩm vào giỏ
export const addToCart = async (req, res) => {
  try {
    const { error } = addToCartSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ message: "Thiếu thông tin người dùng" });

    const { productId, variantId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId: new mongoose.Types.ObjectId(userId) });
    }

    const variant = await Variant.findById(variantId);
    if (!variant) return res.status(404).json({ message: "Không tìm thấy biến thể" });

    let cartItem = await CartItem.findOne({ cartId: cart._id, productId, variantId });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart._id,
        productId,
        variantId,
        quantity,
        price: variant.price,
      });
    }

    res.status(200).json(cartItem);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thêm vào giỏ", error: err.message });
  }
};

// ✅ Lấy giỏ hàng của người dùng
export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.json([]);

    const items = await CartItem.find({ cartId: cart._id })
      .populate("productId")
      .populate("variantId");

    res.json(items);
  } catch (err) {
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
