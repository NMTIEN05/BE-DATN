import Order from '../model/Order.js';
import UserModel from '../model/User.js';
import Product from '../model/Product.js';

// 🔹 Tổng quan dashboard
export const getDashboardSummary = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await UserModel.countDocuments();
    const totalProducts = await Product.countDocuments();

    const totalRevenueAgg = await Order.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    console.log("📊 Tổng đơn:", totalOrders);
    console.log("👥 Tổng user:", totalUsers);
    console.log("📦 Tổng sản phẩm:", totalProducts);
    console.log("💰 Tổng doanh thu:", totalRevenue);

    res.json({ totalOrders, totalUsers, totalProducts, totalRevenue });
  } catch (err) {
    console.error("❌ Lỗi khi tính dashboard summary:", err);
    res.status(500).json({ message: "Server error", error: err.message || err });
  }
};

// 🔹 Biểu đồ đơn hàng theo tháng
export const getMonthlyOrders = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $group: { _id: { $month: '$createdAt' }, orders: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

    const chartData = Array.from({ length: 12 }, (_, i) => {
      const found = result.find(item => item._id === i + 1);
      return { month: `Tháng ${i + 1}`, orders: found?.orders || 0 };
    });

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// 🔹 Sản phẩm bán chạy nhất (theo sold)
export const getBestSellers = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ sold: -1 })
      .limit(5); // Top 5 sản phẩm
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// 🔹 Sản phẩm sắp hết (stock <= 5)
export const getLowStock = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ stock: 1 })
      .limit(5); // Top 5 sản phẩm ít stock
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// 🔹 Sản phẩm tồn ít (stock <= 10)
export const getFewStock = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ stock: 1 })
      .limit(5); // Top 5 tồn ít
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
// 🔹 Sản phẩm khó bán (sold thấp nhất)
export const getHardToSell = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ sold: 1 }) // ít bán nhất
      .limit(5);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
