import Order from "../model/Order.js";

// ✅ Lấy tất cả đơn hàng (hoặc lọc theo trạng thái nếu muốn)
export const getAllOrdersForShipper = async (req, res) => {
  try {
   const orders = await Order.find({
  status: { $in: ["ready_to_ship", "shipped", "delivered", "delivery_failed"] }
})

      .populate("userId", "full_name email") // 🧑‍💼 Lấy tên + email người dùng
      .populate({
        path: "items",
        model: "OrderItem",
        populate: [
          {
            path: "variantId",
            model: "Variant",
            select: "name imageUrl price attributes",
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
      })
      .sort({ createdAt: -1 });

    // ✅ In ra để kiểm tra dữ liệu
    console.log("📦 Danh sách đơn hàng shipper:", JSON.stringify(orders, null, 2));

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("❌ Lỗi lấy đơn hàng shipper:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};



// ✅ Chỉ shipper được cập nhật trạng thái đơn hàng
export const updateOrderStatusByShipper = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // ✅ Chỉ cho phép đổi sang "shipped" hoặc "delivered"
const allowedStatuses = ["shipped", "delivered", "delivery_failed"];


  if (!allowedStatuses.includes(status)) {
    return res.status(403).json({
      message: `Shipper chỉ được phép cập nhật trạng thái sang: ${allowedStatuses.join(", ")}`,
    });
  }

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // ❌ Nếu trạng thái hiện tại là delivered/cancelled/rejected thì không cho đổi nữa
    if (["delivered", "cancelled", "rejected", "returned"].includes(order.status)) {
      return res.status(400).json({
        message: `Không thể thay đổi trạng thái khi đơn hàng đã ở trạng thái: ${order.status}`,
      });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái đơn hàng" });
  }
};

