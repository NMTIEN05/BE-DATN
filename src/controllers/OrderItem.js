import OrderItem from "../model/OrderItem.js";

// 👉 Lấy tất cả OrderItem (admin)
export const getAllOrderItems = async (req, res) => {
  try {
    let {
      offset = "0",
      limit = "10",
      sortBy = "createdAt",
      order = "desc",
      orderId,
      productId,
      variantId,
    } = req.query;

    const offsetNumber = parseInt(offset, 10);
    const limitNumber = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    // Tạo filter
    const filter = {};
    if (orderId) filter.orderId = orderId;
    if (productId) filter.productId = productId;
    if (variantId) filter.variantId = variantId;

    // Truy vấn dữ liệu
    const items = await OrderItem.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(offsetNumber)
      .limit(limitNumber)
      .populate("productId")
      .populate("variantId")
      .populate("orderId");

    const total = await OrderItem.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total,
        offset: offsetNumber,
        limit: limitNumber,
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
    const { id } = req.params;
    const deleted = await OrderItem.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy OrderItem" });
    res.json({ message: "Đã xoá OrderItem" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá OrderItem", error: err.message });
  }
};
