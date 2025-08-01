import Order from '../model/Order.js';
import UserModel from '../model/User.js';
import Product from '../model/Product.js';

export const getDashboardSummary = async (req, res) => {
  try {
    // 🔍 Đếm tổng đơn hàng, người dùng, sản phẩm
    const totalOrders = await Order.countDocuments();
    const totalUsers = await UserModel.countDocuments();
    const totalProducts = await Product.countDocuments();

    // 🧮 Tổng doanh thu từ totalAmount (chứ không phải totalPrice)
    const totalRevenueAgg = await Order.aggregate([
      { $match: { isDeleted: false } }, // lọc nếu có xoá mềm
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // 🪵 Ghi log kiểm tra dữ liệu
    console.log("📊 Tổng đơn:", totalOrders);
    console.log("👥 Tổng user:", totalUsers);
    console.log("📦 Tổng sản phẩm:", totalProducts);
    console.log("💰 Tổng doanh thu:", totalRevenue);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue
    });

  } catch (err) {
    // 🪵 Log lỗi chi tiết
    console.error("❌ Lỗi khi tính dashboard summary:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message || err
    });
  }
};


export const getMonthlyOrders = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const chartData = Array.from({ length: 12 }, (_, i) => {
      const found = result.find((item) => item._id === i + 1);
      return {
        month: `Tháng ${i + 1}`,
        orders: found?.orders || 0,
      };
    });

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
