import express from "express";
import {
  deleteUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUserById,
  login,
  register,
  updateUser,
  verifyEmailCode,
  changePassword,
  verifyRegisterCode,
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser
} from "../controllers/User.js";

import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// 🔐 Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/email-code", verifyEmailCode);
router.post("/email-code/register", verifyRegisterCode);


router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// 🔐 Đổi mật khẩu cho người dùng đang đăng nhập
// ✅ Đặt TRƯỚC các route /:id để tránh nhầm
router.post("/me/change-password", authenticate, changePassword);
router.get("/me", authenticate, getCurrentUser);
router.put("/me", authenticate, updateCurrentUser);
router.delete("/me", authenticate, deleteCurrentUser);
// 👤 User management
router.get("/", authenticate, getAllUsers);
router.get("/:id", authenticate, getUserById);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, requireAdmin, deleteUser);

export default router;
