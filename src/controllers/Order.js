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
import Voucher from "../model/voucher.js";


export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    const { shippingInfo, paymentMethod, itemsToCheckout, voucherCode } = req.body;

    // ✅ Validate shippingInfo
    if (
      !shippingInfo ||
      typeof shippingInfo !== 'object' ||
      !shippingInfo.fullName ||
      !shippingInfo.phone ||
      !shippingInfo.address
    ) {
      return res.status(400).json({ message: 'Thông tin giao hàng không hợp lệ' });
    }

    // ✅ Validate danh sách sản phẩm
    if (!itemsToCheckout || !Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
      return res.status(400).json({ message: 'Danh sách sản phẩm thanh toán không hợp lệ' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ userId: userObjectId });
    if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

    const cartItems = await CartItem.find({
      cartId: cart._id,
      variantId: { $in: itemsToCheckout.map((item) => item.variantId) },
    }).populate('variantId');

    if (!cartItems.length) {
      return res.status(400).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }

    // ✅ Tạo đơn hàng rỗng trước
    const order = await Order.create({
      userId: userObjectId,
      items: [],
      totalAmount: 0,
      discount: 0,
      shippingInfo: {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        ward: shippingInfo.ward || '',
        district: shippingInfo.district || '',
        province: shippingInfo.province || '',
      },
      paymentMethod,
      status: 'pending',
      shipperId: null,  // Chưa giao cho shipper nào
    });

    const orderItems = [];

   for (const selectedItem of itemsToCheckout) {
  const cartItem = cartItems.find(
    (ci) => ci.variantId._id.toString() === selectedItem.variantId
  );

  if (!cartItem) {
    return res.status(400).json({ message: 'Sản phẩm không nằm trong giỏ hàng' });
  }

  const variant = await Variant.findById(selectedItem.variantId);
  if (!variant) {
    return res.status(404).json({ message: 'Không tìm thấy biến thể sản phẩm' });
  }

  const quantity = selectedItem.quantity;

  if (variant.stock < quantity) {
    return res.status(400).json({
      message: `Sản phẩm \"${variant.name}\" không đủ hàng. Hiện còn ${variant.stock}`,
    });
  }

  // ⚡️ So sánh giá cũ (từ client/cart) với giá hiện tại
  const currentPrice = variant.price || 0;
  if (selectedItem.price && selectedItem.price !== currentPrice) {
    // Bạn có thể return lỗi hoặc chỉ cảnh báo tuỳ ý
    return res.status(400).json({
      message: `Giá sản phẩm "${variant.name}" đã thay đổi từ ${selectedItem.price.toLocaleString(
        'vi-VN'
      )}₫ sang ${currentPrice.toLocaleString('vi-VN')}₫. Vui lòng kiểm tra lại.`,
    });
  }

  // ✅ Trừ tồn kho
  variant.stock -= quantity;
  await variant.save();

  // ✅ Tạo orderItem với giá mới nhất
  const orderItem = await OrderItem.create({
    orderId: order._id,
    productId: cartItem.productId,
    variantId: variant._id,
    quantity,
    price: currentPrice,
  });

  orderItems.push(orderItem);
}


    // ✅ Xoá item trong giỏ đã đặt
    const variantIdsToRemove = itemsToCheckout.map((item) => item.variantId);
    await CartItem.deleteMany({
      cartId: cart._id,
      variantId: { $in: variantIdsToRemove },
    });

    // ✅ Tính tổng tiền
    let totalAmountServer = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // ✅ Mã giảm giá
    let discountAmount = 0;
    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode });

      if (!voucher) {
        return res.status(400).json({ message: 'Mã giảm giá không tồn tại' });
      }

      const now = new Date();
      if (now < voucher.startDate || now > voucher.endDate) {
        return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
      }

      if (voucher.usedCount >= voucher.usageLimit) {
        return res.status(400).json({ message: 'Mã giảm giá đã được sử dụng hết' });
      }

      if (totalAmountServer < voucher.minOrderValue) {
        return res.status(400).json({
          message: `Đơn hàng phải đạt tối thiểu ${voucher.minOrderValue.toLocaleString(
            'vi-VN'
          )}₫ để dùng mã`,
        });
      }

      if (voucher.discountType === 'fixed') {
        discountAmount = voucher.discountValue;
      } else if (voucher.discountType === 'percentage') {
        const percent = (totalAmountServer * voucher.discountValue) / 100;
        discountAmount = voucher.maxDiscount
          ? Math.min(percent, voucher.maxDiscount)
          : percent;
      }

      voucher.usedCount += 1;
      await voucher.save();
    }

    const finalTotal = Math.max(0, totalAmountServer - discountAmount);

    // ✅ Cập nhật đơn hàng
    order.items = orderItems.map((item) => item._id);
    order.totalAmount = finalTotal;
    order.discount = discountAmount;
    await order.save();

    // ✅ Gửi email xác nhận
    const user = await UserModel.findById(userId);
    if (user?.email) {
      const html = generateOrderConfirmationEmail(
        user.full_name || user.username,
        order._id,
        finalTotal
      );
      await sendEmail(user.email, '✅ Xác nhận đơn hàng từ HolaPhone', { html });
    }

    return res.status(201).json(order);
  } catch (err) {
    console.error('❌ Lỗi khi tạo đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng', error: err.message });
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
      // .populate("shipperId", "full_name email phone")  // populate thông tin shipper
      .populate({ path: "shipperId", model: "UserModel", select: "full_name email phone" })
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
    //  .populate("shipperId", "full_name email phone")
     .populate({ path: "shipperId", model: "UserModel", select: "full_name email phone" })
.populate({ path: "userId", model: "UserModel", select: "full_name email" })

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
  "pending", "processing", "ready_to_ship", "shipped",
  "delivered", "received", "delivery_failed",
  "return_requested", "returned", "cancelled", "rejected"
];

const STATUS_FLOW = {
  pending: ["processing", "cancelled"],
  processing: ["ready_to_ship", "cancelled"],
  ready_to_ship: ["shipped", "cancelled"],
  shipped: ["delivered", "delivery_failed"],
  delivery_failed: ["shipped"],
  delivered: ["received", "return_requested"],
  received: ["return_requested"],
  return_requested: ["returned", "delivered", "rejected"],
  returned: [],
  cancelled: [],
  rejected: []
};

const FORBIDDEN_ADMIN_STATUSES = ["shipped", "delivered", "received"];

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, rejectReason, failReason, shipperId } = req.body;
    const { id } = req.params;

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const currentStatus = order.status;

    // ❌ Admin không được sửa khi đơn đã vào tay shipper
    if (req.user.role === "admin" && FORBIDDEN_ADMIN_STATUSES.includes(currentStatus)) {
      return res.status(403).json({
        message: `Admin không được phép cập nhật đơn hàng ở trạng thái '${currentStatus}'`,
      });
    }

    // ✅ Trường hợp từ chối yêu cầu trả hàng
    if (currentStatus === "return_requested" && status === "rejected") {
      if (!rejectReason || rejectReason.trim() === "") {
        return res.status(400).json({ message: "Vui lòng nhập lý do từ chối trả hàng" });
      }

      order.status = "rejected";
      order.returnRequest = {
        status: "rejected",
        reason: rejectReason.trim(),
        requestedAt: new Date(),
      };

      await order.save();
      return res.json({ message: "Đã từ chối yêu cầu trả hàng", order });
    }

    // ✅ Trường hợp giao hàng thất bại
    if (currentStatus === "shipped" && status === "delivery_failed") {
      if (!failReason || failReason.trim() === "") {
        return res.status(400).json({ message: "Vui lòng nhập lý do giao hàng không thành công" });
      }

      order.status = "delivery_failed";
      order.deliveryFailedReason = failReason.trim();
      await order.save();

      return res.json({ message: "Cập nhật trạng thái: giao hàng thất bại", order });
    }

    // ❌ Kiểm tra trạng thái kế tiếp có hợp lệ không
    const allowedNextStatuses = STATUS_FLOW[currentStatus] || [];
    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Không thể chuyển từ '${currentStatus}' sang '${status}'`
      });
    }

    // ✅ Cập nhật trạng thái
    order.status = status;

    // ✅ Nếu đơn COD và đã giao / đã nhận thì auto chuyển sang "Đã thanh toán"
    if (order.paymentMethod === "COD" && ["delivered", "received"].includes(status)) {
      order.paymentStatus = "paid";
    }

    // ✅ Cập nhật shipperId nếu có
    if (shipperId) {
      order.shipperId = shipperId;
    }

    // ❌ Xóa shipperId khi đơn bị hủy / trả / từ chối
    if (["cancelled", "returned", "rejected"].includes(status)) {
      order.shipperId = undefined;
    }

    await order.save();

    // ✅ Gửi email thông báo cho user
    const user = await UserModel.findById(order.userId);
    if (user && user.email) {
      const html = generateOrderStatusEmail(
        user.full_name || user.username,
        order._id,
        status
      );
      await sendEmail(user.email, "🔔 Cập nhật trạng thái đơn hàng", { html });
    }

    res.json(order);
  } catch (err) {
    console.error("❌ Lỗi cập nhật đơn hàng:", err);
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
    const { reason } = req.body;
    const userId = req.user._id;

    // Kiểm tra lý do
    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "Vui lòng nhập lý do hủy đơn hàng." });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Kiểm tra quyền sở hữu
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền huỷ đơn hàng này" });
    }

    // Chỉ cho phép huỷ ở trạng thái "pending" hoặc "processing"
    if (!["pending", "processing"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: `Không thể huỷ đơn hàng ở trạng thái "${order.status}"` });
    }

    // Thực hiện huỷ
    order.status = "cancelled";
    order.cancelReason = reason;
    await order.save();

    res.json({ message: "Huỷ đơn hàng thành công", order });
  } catch (err) {
    res.status(500).json({ message: "Lỗi huỷ đơn hàng", error: err.message });
  }
};

export const requestReturn = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body; // <-- lấy lý do từ body
  const userId = req.user._id;

  try {
    const order = await Order.findById(orderId);
    if (!order || order.isDeleted)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (!order.userId.equals(userId))
      return res.status(403).json({ message: "Không có quyền trả hàng đơn này" });

    if (order.status !== "delivered")
      return res.status(400).json({ message: "Chỉ trả hàng khi đã giao" });

    if (order.returnRequest?.status)
      return res.status(400).json({ message: "Đơn hàng đã yêu cầu trả trước đó" });

    if (!reason || reason.trim() === "")
      return res.status(400).json({ message: "Vui lòng cung cấp lý do trả hàng" });

    // Cập nhật trạng thái và thông tin yêu cầu trả hàng
    order.status = "return_requested";
    order.returnRequest = {
      status: "pending",
      requestedAt: new Date(),
      reason: reason.trim(), // ✅ lưu lý do
    };

    await order.save();
    return res.json({ message: "Đã gửi yêu cầu trả hàng", order });
  } catch (error) {
    console.error("❌ Lỗi khi yêu cầu trả hàng:", error);
    return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
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
export const confirmReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra quyền sở hữu
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xác nhận đơn hàng này" });
    }

    // Chỉ xác nhận khi trạng thái hiện tại là 'delivered'
    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Chỉ có thể xác nhận khi đơn hàng ở trạng thái 'Đã giao'" });
    }

    // Cập nhật trạng thái
    order.status = "received";
    await order.save();

    res.json({ message: "Xác nhận đã nhận hàng thành công", order });
  } catch (err) {
    console.error("❌ Lỗi xác nhận đã nhận hàng:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
export const assignShipperToOrder = async (req, res) => {
  try {
    const { id } = req.params; // orderId
    const { shipperId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(shipperId)) {
      return res.status(400).json({ message: "ID đơn hàng hoặc shipper không hợp lệ" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Chỉ cho phép gán shipper khi trạng thái đơn là 'pending' hoặc 'ready_to_ship'
    if (!["pending", "ready_to_ship"].includes(order.status)) {
      return res.status(400).json({ message: `Chỉ có thể phân công shipper khi đơn ở trạng thái '${order.status}'` });
    }

    order.shipperId = shipperId;

    // Nếu muốn, có thể cập nhật trạng thái sang 'ready_to_ship' khi gán shipper lần đầu (tuỳ logic của bạn)
    if (order.status === "pending") {
      order.status = "ready_to_ship";
    }

    await order.save();

    return res.json({ message: "Phân công shipper thành công", order });
  } catch (error) {
    console.error("❌ Lỗi phân công shipper:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
export const getOrdersByShipper = async (req, res) => {
  try {
    console.log("req.user:", req.user); // 👈 Xem user có _id không

    const shipperId = req.user.id; // thay vì req.user._id

    if (!shipperId) {
      return res.status(400).json({ message: "Không xác định được shipperId" });
    }

    const { offset = 0, limit = 10, status } = req.query;

    const filter = { shipperId };
    if (status) filter.status = status;

  const [orders, total] = await Promise.all([
  Order.find(filter)
    .populate("userId", "-password")
    .populate({
      path: "items",           // bước 1: populate OrderItem
      populate: {
        path: "variantId",     // bước 2: populate Variant
        select: "name imageUrl price"
      }
    })
    .skip(Number(offset))
    .limit(Number(limit))
    .sort({ createdAt: -1 }),
  Order.countDocuments(filter),
]);


    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        offset: Number(offset),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("getOrdersByShipper error:", error); // 👈 In full lỗi
    return res.status(500).json({ message: error.message, stack: error.stack });
  }
};



