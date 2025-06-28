import OrderItem from "../model/OrderItem.js";

// 👉 Lấy tất cả OrderItem (admin)
export const getAllOrderItems = async (req, res) => {
  try {
    const items = await OrderItem.find()
      .populate("productId")
      .populate("variantId")
      .populate("orderId");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy OrderItem", error: err.message });
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
