import mongoose from "mongoose";
import Order from "../model/Order.js";
import OrderItem from "../model/OrderItem.js";
import Cart from "../model/Cart.js";
import CartItem from "../model/CartItem.js";
import { orderSchema } from "../validate/Order.js"; // ✅ Thêm validate

export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    // ✅ Validate dữ liệu đầu vào từ client
    const { error } = orderSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ userId: userObjectId });
    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    const cartItems = await CartItem.find({ cartId: cart._id }).populate("variantId");
    if (!cartItems.length) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // ✅ Tạo đơn hàng rỗng để lấy order._id
    const order = await Order.create({
      userId: userObjectId,
      items: [],
      totalAmount: 0,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      status: "pending",
    });

    // ✅ Tạo các orderItem và liên kết với orderId
    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        const price = item.variantId?.price || 0;
        return await OrderItem.create({
          orderId: order._id,
          productId: item.productId,
          variantId: item.variantId._id,
          quantity: item.quantity,
          price,
        });
      })
    );

    // ✅ Tính tổng tiền
    const totalAmountServer = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // ✅ So sánh tổng tiền với client gửi
    if (totalAmountServer !== req.body.totalAmount) {
      return res.status(400).json({
        message: "Tổng tiền không khớp với server",
        expected: totalAmountServer,
        received: req.body.totalAmount,
      });
    }

    // ✅ Cập nhật lại đơn hàng với danh sách orderItem và totalAmount
    order.items = orderItems.map((i) => i._id);
    order.totalAmount = totalAmountServer;
    await order.save();

    // ✅ Xoá giỏ hàng
    await CartItem.deleteMany({ cartId: cart._id });

    res.status(201).json(order);
  } catch (err) {
    console.error("❌ Lỗi khi tạo đơn hàng:", err);
    res.status(500).json({
      message: "Lỗi khi tạo đơn hàng",
      error: err.message,
    });
  }
};



export const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    const orders = await Order.find({ userId }).populate({
      path: "items",
      populate: {
        path: "variantId",
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
    let {
      offset = "0",
      limit = "10",
      sortBy = "createdAt",
      order = "desc",
      status,
      userId,
    } = req.query;

    const offsetNumber = parseInt(offset, 10);
    const limitNumber = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const orders = await Order.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(offsetNumber)
      .limit(limitNumber)
      .populate("userId", "full_name email")
      .populate({
        path: "items",
        populate: {
          path: "variantId",
          select: "name imageUrl price",
        },
      });

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        offset: offsetNumber,
        limit: limitNumber,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi lấy tất cả đơn hàng",
      error: err.message,
    });
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
