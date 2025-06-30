import OrderItem from "../model/OrderItem.js";
import {
  orderItemQuerySchema,
  orderItemIdParamSchema,
  orderItemByOrderIdSchema,
} from "../validate/OrderItem.js";

// 👉 Lấy tất cả OrderItem (admin)
export const getAllOrderItems = async (req, res) => {
  try {
    const { error, value } = orderItemQuerySchema.validate(req.query, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Tham số truy vấn không hợp lệ",
        errors: error.details.map((e) => e.message),
      });
    }

    const { offset, limit, sortBy, order, orderId, productId, variantId } = value;
    const sortOrder = order === "desc" ? -1 : 1;

    const filter = {};
    if (orderId) filter.orderId = orderId;
    if (productId) filter.productId = productId;
    if (variantId) filter.variantId = variantId;

    const items = await OrderItem.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(offset)
      .limit(limit)
      .populate("productId")
      .populate("variantId")
      .populate("orderId");

    const total = await OrderItem.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total,
        offset,
        limit,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi lấy OrderItem",
      error: err.message,
    });
  }
};

// 👉 Lấy OrderItem theo orderId
export const getOrderItemsByOrderId = async (req, res) => {
  try {
    const { error } = orderItemByOrderIdSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        message: "orderId không hợp lệ",
        errors: error.details.map((e) => e.message),
      });
    }

    const { orderId } = req.params;
    const items = await OrderItem.find({ orderId })
      .populate("productId")
      .populate("variantId");

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy OrderItem theo đơn hàng", error: err.message });
  }
};

// 👉 Xoá 1 OrderItem
export const deleteOrderItem = async (req, res) => {
  try {
    const { error } = orderItemIdParamSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        message: "ID không hợp lệ",
        errors: error.details.map((e) => e.message),
      });
    }

    const { id } = req.params;
    const deleted = await OrderItem.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy OrderItem" });
    }

    res.json({ message: "Đã xoá OrderItem" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá OrderItem", error: err.message });
  }
};
