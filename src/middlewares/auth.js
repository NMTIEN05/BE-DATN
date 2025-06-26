import jwt from "jsonwebtoken";

// Middleware xác thực JWT
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ message: "Không có token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "tiendz");
    req.user = decoded; // lưu user vào request
    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// Middleware chỉ cho admin
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới được phép thực hiện thao tác này" });
  }
  next();
};
