import mongoose from "mongoose";
import Order from "../model/Order.js";
import OrderItem from "../model/OrderItem.js";
import Cart from "../model/Cart.js";
import CartItem from "../model/CartItem.js";
import { orderSchema } from "../validate/Order.js"; // ✅ Thêm validate
import UserModel from "../model/User.js";
import { generateOrderConfirmationEmail, generateOrderStatusEmail } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendMail.js";
import Variant from "../model/Variant.js";


export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

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

    // ✅ Tạo đơn hàng ban đầu (trống)
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

    const orderItems = [];

    // ✅ Duyệt từng sản phẩm trong giỏ, kiểm tra tồn kho và tạo OrderItem
    for (const item of cartItems) {
      const variant = await Variant.findById(item.variantId._id);
      if (!variant) {
        return res.status(404).json({ message: "Không tìm thấy biến thể sản phẩm" });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm "${variant.name}" không đủ hàng. Hiện còn ${variant.stock}`,
        });
      }

      // ✅ Trừ tồn kho
      variant.stock -= item.quantity;
      await variant.save();

      // ✅ Tạo OrderItem
      const price = variant.price || 0;
      const orderItem = await OrderItem.create({
        orderId: order._id,
        productId: item.productId,
        variantId: variant._id,
        quantity: item.quantity,
        price,
      });

      orderItems.push(orderItem);
    }

    // ✅ Tính lại tổng tiền từ server
    const totalAmountServer = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (totalAmountServer !== totalAmount) {
      return res.status(400).json({
        message: "Tổng tiền không khớp với server",
        expected: totalAmountServer,
        received: totalAmount,
      });
    }

    // ✅ Cập nhật lại đơn hàng với danh sách item và tổng tiền
    order.items = orderItems.map((item) => item._id);
    order.totalAmount = totalAmountServer;
    await order.save();

    // ✅ Xoá giỏ hàng sau khi đặt hàng
    await CartItem.deleteMany({ cartId: cart._id });

    // ✅ Gửi email xác nhận
    const user = await UserModel.findById(userId);
    if (user?.email) {
      const html = generateOrderConfirmationEmail(
        user.full_name || user.username,
        order._id,
        totalAmountServer
      );
      await sendEmail(user.email, "✅ Xác nhận đơn hàng từ HolaPhone", { html });
    }

    return res.status(201).json(order);
  } catch (err) {
    console.error("❌ Lỗi khi tạo đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error: err.message });
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
      model: "OrderItem", // Model của items trong order
      populate: [
        {
          path: "variantId",
          model: "Variant",
          populate: [
            {
              path: "attributes.attributeId",
              model: "Attribute",
            },
            {
              path: "attributes.attributeValueId",
              model: "AttributeValue",
            },
          ],
        },
        {
          path: "productId",
          model: "Product",
          select: "name capacity",
        },
      ],
    });

    // In log để debug
    console.log("🔍 Orders fetched for user:", userId);
    console.dir(orders?.[0]?.items?.[0], { depth: null });

    return res.json({ data: orders });
  } catch (err) {
    console.error("❌ Lỗi khi lấy đơn hàng:", err);
    return res.status(500).json({ message: "Lỗi lấy đơn hàng", error: err.message });
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
        model: "OrderItem",
        populate: [
          {
            path: "variantId",
            model: "Variant",
            select: "name imageUrl price",
            populate: [
              {
                path: "attributes.attributeId",
                model: "Attribute",
              },
              {
                path: "attributes.attributeValueId",
                model: "AttributeValue",
              },
            ],
          },
          {
            path: "productId",
            model: "Product",
            select: "name capacity",
          },
        ],
      });

    const total = await Order.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        offset: offsetNumber,
        limit: limitNumber,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi lấy tất cả đơn hàng:", err);
    return res.status(500).json({
      message: "Lỗi lấy tất cả đơn hàng",
      error: err.message,
    });
  }
};


export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items',
        model: 'OrderItem',
        populate: [
          {
            path: 'variantId',
            model: 'Variant',
            select: 'name imageUrl price attributes',
            populate: [
              {
                path: 'attributes.attributeId',
                model: 'Attribute',
              },
              {
                path: 'attributes.attributeValueId',
                model: 'AttributeValue',
              },
            ],
          },
          {
            path: 'productId',
            model: 'Product',
            select: 'name capacity',
          },
        ],
      });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.json(order);
  } catch (err) {
    console.error('❌ Lỗi khi lấy chi tiết đơn hàng:', err);
    res.status(500).json({
      message: 'Lỗi chi tiết đơn hàng',
      error: err.message,
    });
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
export const updateShippingInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, address } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Không cho sửa nếu đơn đã giao hoặc đã huỷ
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'Không thể sửa đơn hàng đã hoàn tất hoặc huỷ' });
    }

    order.shippingInfo = {
      ...order.shippingInfo,
      fullName,
      phone,
      address,
    };

    await order.save();

    res.status(200).json({ message: 'Cập nhật thông tin giao hàng thành công', order });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
export const cancelOrderByCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    // Kiểm tra quyền sở hữu
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền huỷ đơn hàng này' });
    }

    // Chỉ cho phép huỷ ở trạng thái "pending" hoặc "processing"
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: `Không thể huỷ đơn hàng ở trạng thái "${order.status}"` });
    }

    // Thực hiện huỷ
    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Huỷ đơn hàng thành công', order });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi huỷ đơn hàng', error: err.message });
  }
};
export const requestReturn = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const order = await Order.findById(orderId);
  if (!order || order.isDeleted)
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

  if (!order.userId.equals(userId))
    return res.status(403).json({ message: "Không có quyền trả hàng đơn này" });

  if (order.status !== "delivered")
    return res.status(400).json({ message: "Chỉ trả hàng khi đã giao" });

  if (order.returnRequest?.status)
    return res.status(400).json({ message: "Đơn hàng đã yêu cầu trả trước đó" });

  order.status = "return_requested"; // cập nhật trạng thái đơn hàng
  order.returnRequest = {
    status: "pending",
    requestedAt: new Date(),
  };

  await order.save();
  return res.json({ message: "Đã gửi yêu cầu trả hàng", order });
};


export const updateReturnStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action } = req.body; // "approve" hoặc "reject"

    const order = await Order.findById(orderId);
    if (!order?.returnRequest) {
      return res.status(404).json({ message: "Không có yêu cầu trả hàng" });
    }

    if (order.returnRequest.status !== "pending") {
      return res.status(400).json({ message: "Yêu cầu không ở trạng thái chờ duyệt" });
    }

    if (action === "approve") {
      order.returnRequest.status = "approved";
      order.returnRequest.approvedAt = new Date();
    } else if (action === "reject") {
      order.returnRequest.status = "rejected";
    } else {
      return res.status(400).json({ message: "Hành động không hợp lệ" });
    }

    await order.save();
    res.json({ message: `Đã ${action === "approve" ? "duyệt" : "từ chối"} yêu cầu trả hàng` });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
export const markReturned = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order?.returnRequest || order.returnRequest.status !== "approved") {
      return res.status(400).json({ message: "Chưa thể đánh dấu đã trả hàng" });
    }

    order.returnRequest.status = "returned";
    await order.save();

    res.json({ message: "Đã đánh dấu là đã nhận hàng hoàn trả" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
export const markRefunded = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order?.returnRequest || order.returnRequest.status !== "returned") {
      return res.status(400).json({ message: "Chưa thể hoàn tiền vì chưa nhận lại hàng" });
    }

    order.returnRequest.status = "refunded";
    order.returnRequest.refundedAt = new Date();
    await order.save();

    res.json({ message: "Đã hoàn tiền cho khách hàng" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi hoàn tiền", error: err.message });
  }
};
