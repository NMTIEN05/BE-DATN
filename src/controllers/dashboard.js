import Order from '../model/Order.js';
import UserModel from '../model/User.js';
import Product from '../model/Product.js';
import Variant from "../model/Variant.js";

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
    const products = await Product.find({}, "title soldCount imageUrl");

    // Tính tổng stock cho mỗi product
    const result = await Promise.all(
      products.map(async (product) => {
        const variants = await Variant.find({ productId: product._id }, "stock");
        const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

        return {
          _id: product._id,
          title: product.title,
          soldCount: product.soldCount,
          quantity: totalStock,
          imageUrl: product.imageUrl,
        };
      })
    );
  // sort theo soldCount giảm dần
    const bestSellers = result.sort((a, b) => b.soldCount - a.soldCount).slice(0, 5);

    res.json(bestSellers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// 🔹 Sản phẩm tồn ít (stock <= 10)
export const getLowStock = async (req, res) => {
  try {
    const products = await Product.find({}, "title soldCount imageUrl");

    const result = await Promise.all(
      products.map(async (product) => {
        const variants = await Variant.find({ productId: product._id }, "stock");
        const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

        return {
          _id: product._id,
          title: product.title,
          soldCount: product.soldCount,
          quantity: totalStock,
          imageUrl: product.imageUrl,
        };
      })
    );

    const lowStock = result.filter((p) => p.quantity <= 5).slice(0, 5);

    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
// 🔹 Sản phẩm tồn ít (stock <= 10)
export const getFewStock = async (req, res) => {
  try {
    const products = await Product.find({}, "title soldCount imageUrl");

    const result = await Promise.all(
      products.map(async (product) => {
        const variants = await Variant.find({ productId: product._id }, "stock");
        const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

        return {
          _id: product._id,
          title: product.title,
          soldCount: product.soldCount,
          quantity: totalStock,
          imageUrl: product.imageUrl,
        };
      })
    );

    const fewStock = result.filter((p) => p.quantity <= 10).slice(0, 5);

    res.json(fewStock);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// 🔹 Sản phẩm khó bán (sold thấp nhất)
export const getHardToSell = async (req, res) => {
  try {
    const products = await Product.find({}, "title soldCount imageUrl");

    const result = await Promise.all(
      products.map(async (product) => {
        const variants = await Variant.find({ productId: product._id }, "stock");
        const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

        return {
          _id: product._id,
          title: product.title,
          soldCount: product.soldCount,
          quantity: totalStock,
          imageUrl: product.imageUrl,
        };
      })
    );

    const hardToSell = result.sort((a, b) => a.soldCount - b.soldCount).slice(0, 5);

    res.json(hardToSell);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};