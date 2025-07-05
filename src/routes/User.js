import express from "express";
import { deleteUser,forgotPassword,resetPassword, getAllUsers, getUserById, login, register, updateUser, verifyEmailCode, changePassword } from "../controllers/User.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";



const router = express.Router();

router.post("/register", register  )
router.post("/login", login  )
router.post("/email-code", verifyEmailCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticate,changePassword)
// Public (hoặc đã login)
router.get("/", authenticate, getAllUsers);
router.get("/:id", authenticate, getUserById);
router.put("/:id", authenticate, updateUser);
// ✅ Chỉ admin mới được xoá
router.delete("/:id", authenticate, requireAdmin, deleteUser);

export default router;
