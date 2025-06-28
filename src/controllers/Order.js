import mongoose from "mongoose";
import Order from "../model/Order.js";
import OrderItem from "../model/OrderItem.js";
import Cart from "../model/Cart.js";
import CartItem from "../model/CartItem.js";


export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ từ middleware

    console.log("userId nhận được:", userId);

    // Ép kiểu và kiểm tra hợp lệ
    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    const userObjectId = new mongoose.Types.ObjectId(String(userId));

    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ userId: userObjectId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    // Lấy tất cả item trong giỏ
    const cartItems = await CartItem.find({ cartId: cart._id }).populate("variantId");
    if (!cartItems.length) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // ✅ Bước 1: tạo Order trước (tạm thời rỗng)
    const order = await Order.create({
      userId: userObjectId,
      items: [],
      totalAmount: 0,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      status: "pending",
    });

    // ✅ Bước 2: tạo các OrderItem với orderId chính xác
    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        const price = item.variantId.price;
        return await OrderItem.create({
          orderId: order._id,
          productId: item.productId,
          variantId: item.variantId._id,
          quantity: item.quantity,
          price,
        });
      })
    );

    // ✅ Bước 3: cập nhật lại đơn hàng
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    order.items = orderItems.map((item) => item._id);
    order.totalAmount = totalAmount;
    await order.save();

    // ✅ Xóa giỏ hàng sau khi đặt hàng
    await CartItem.deleteMany({ cartId: cart._id });

    res.status(201).json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({
      message: "Lỗi khi tạo đơn hàng",
      error: err.message,
    });
  }
};


export const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ đúng key từ middleware

    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    const orders = await Order.find({ userId }).populate({
      path: "items",
      populate: {
        path: "variantId", // nếu bạn muốn xem chi tiết biến thể
        model: "Variant",
      },
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy đơn hàng", error: err.message });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'full_name email') // Thông tin user
      .populate({
        path: 'items',           // items là mảng ObjectId OrderItem
        populate: {
          path: 'variantId',     // populate biến thể trong từng OrderItem
          select: 'name imageUrl price'
        }
      });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy tất cả đơn hàng", error: err.message });
  }
};


export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items");
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Lỗi chi tiết đơn hàng", error: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await OrderItem.deleteMany({ orderId: req.params.id });
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Xoá đơn hàng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá đơn hàng", error: err.message });
  }
};
