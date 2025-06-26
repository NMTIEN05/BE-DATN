import Cart from "../model/Cart.js";




export const addToCart = async (req, res) => {
  const { userId } = req.user; // từ middleware auth
  const { productId, variantId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const existing = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variantId.toString() === variantId
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productId, variantId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thêm giỏ hàng", error: err.message });
  }
};
export const getCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Chưa xác thực người dùng" });

    const cart = await Cart.findOne({ userId })
      .populate("items.productId")
      .populate("items.variantId");

    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy giỏ hàng", error: err.message });
  }
};


export const removeFromCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    const initialLength = cart.items.length;

    // Lọc bỏ item có id trùng khớp
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm để xoá" });
    }

    await cart.save();
    res.json({ message: "Xoá sản phẩm thành công", cart });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xoá sản phẩm", error: err.message });
  }
};

export const updateQuantity = async (req, res) => {
  const { userId } = req.user;
  const { productId, variantId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    const item = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variantId?.toString() === variantId
    );

    if (item) {
      item.quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: "Sản phẩm không có trong giỏ" });
    }
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật số lượng", error: err.message });
  }
};
// controllers/Cart.js
export const clearCart = async (req, res) => {
  const { userId } = req.user;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    cart.items = []; // Xoá toàn bộ sản phẩm
    await cart.save();

    res.json({ message: "Đã xoá toàn bộ giỏ hàng", cart });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá giỏ hàng", error: err.message });
  }
};




