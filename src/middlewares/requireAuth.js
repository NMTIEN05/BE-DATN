import jwt from "jsonwebtoken";
import User from "../model/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Sửa ở đây: dùng decoded.id thay vì decoded.userId
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Người dùng không hợp lệ" });

    // Gắn thông tin vào req.user
    req.user = {
      userId: user._id,
      role: user.role,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Xác thực thất bại", error: err.message });
  }
};
