import mongoose from "mongoose";
import Order from "../model/Order.js";
import OrderItem from "../model/OrderItem.js";
import Cart from "../model/Cart.js";
import CartItem from "../model/CartItem.js";
import { orderSchema } from "../validate/Order.js"; // ✅ Thêm validate
import UserModel from "../model/User.js";
import { generateOrderConfirmationEmail, generateOrderStatusEmail } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendMail.js";

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

    const { shippingInfo, paymentMethod, totalAmount } = req.body;

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
      shippingInfo: {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
      },
      paymentMethod,
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
    if (totalAmountServer !== totalAmount) {
      return res.status(400).json({
        message: "Tổng tiền không khớp với server",
        expected: totalAmountServer,
        received: totalAmount,
      });
    }

    // ✅ Cập nhật lại đơn hàng với danh sách orderItem và totalAmount
    order.items = orderItems.map((i) => i._id);
    order.totalAmount = totalAmountServer;
    await order.save();

    // ✅ Xoá giỏ hàng
    await CartItem.deleteMany({ cartId: cart._id });

    // ✅ Gửi email xác nhận đơn hàng
    const user = await UserModel.findById(userId);
    if (user && user.email) {
      const html = generateOrderConfirmationEmail(
        user.full_name || user.username,
        order._id,
        totalAmountServer
      );
      await sendEmail(
        user.email,
        "✅ Xác nhận đơn hàng từ HolaPhone",
        { html }
      );
    }

    // ✅ Trả về phản hồi
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

    const filter = { userId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter).populate({
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

const ALLOWED_STATUS = [
  "pending",
  "processing",
  "ready_to_ship",
  "shipped",
  "delivered",
  "return_requested",
  "returned",
  "cancelled"
];

// Trạng thái cho phép tiếp theo từ mỗi trạng thái
const STATUS_FLOW = {
  pending: ["processing", "cancelled"],
  processing: ["ready_to_ship", "cancelled"],
  ready_to_ship: ["shipped", "cancelled"],
  shipped: ["delivered", "return_requested"],
  delivered: ["return_requested"],
  return_requested: ["returned", "cancelled"],
  returned: [],
  cancelled: []
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const currentStatus = order.status;

    // Nếu không cho phép chuyển từ currentStatus → status mới
    const allowedNextStatuses = STATUS_FLOW[currentStatus] || [];
    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Không thể chuyển từ '${currentStatus}' sang '${status}'`
      });
    }

    // Cập nhật
    order.status = status;
    await order.save();

    // Gửi email
    const user = await UserModel.findById(order.userId);
    if (user && user.email) {
      const html = generateOrderStatusEmail(user.full_name || user.username, order._id, status);
      await sendEmail(user.email, "🔔 Cập nhật trạng thái đơn hàng", { html });
    }

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
