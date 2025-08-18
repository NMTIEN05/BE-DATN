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
  const { status, failReason } = req.body;

  // ✅ Shipper chỉ được cập nhật các trạng thái này
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

    // ❌ Nếu đơn đã kết thúc thì không cho đổi nữa
    if (["delivered", "cancelled", "rejected", "returned"].includes(order.status)) {
      return res.status(400).json({
        message: `Không thể thay đổi trạng thái khi đơn hàng đã ở trạng thái: ${order.status}`,
      });
    }

    // ✅ Cập nhật trạng thái
    order.status = status;

    // 👉 Nếu shipper giao thành công + đơn COD => coi như đã thanh toán
    if (status === "delivered" && order.paymentMethod?.toLowerCase() === "cod") {
      order.paymentStatus = "paid";
    }

    // 👉 Nếu thất bại => lưu lý do
    if (status === "delivery_failed" && failReason) {
      order.failReason = failReason;
    }

    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái đơn hàng", error: error.message });
  }
};


