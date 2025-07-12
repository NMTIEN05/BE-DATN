import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../model/User.js";
import sendEmail, { generatePasswordChangedEmail } from "../utils/sendMail.js";
import { generateEmailVerificationCodeView } from "../views/auth.js";
import { registerSchema, loginSchema } from "../validate/Auth.js";
import { updateUserSchema, changePasswordSchema } from "../validate/User.js";

// Tạo mã xác thực 6 số
const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// [POST] /auth/register
async function register(req, res) {
  console.log("🔍 register body:", req.body);

  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { username, full_name, email, password, phone, address, role } = req.body;

    const existingUser = await UserModel.findOne({ email });

    const code = generateVerificationCode();

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "Email đã được sử dụng." });
      }

      existingUser.emailVerifyCode = code;
      existingUser.emailVerifyExpires = Date.now() + 15 * 60 * 1000;
      await existingUser.save();

      const html = generateEmailVerificationCodeView(code);
      await sendEmail(email, "Mã xác thực tài khoản", { html });

      return res.status(200).json({
        message: "Email đã tồn tại nhưng chưa xác minh. Mã xác minh mới đã được gửi.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userCreated = await UserModel.create({
      username,
      full_name,
      email,
      password: hashedPassword,
      phone,
      address: address || "",
      role: role || "user",
      isVerified: false,
      emailVerifyCode: code,
      emailVerifyExpires: Date.now() + 15 * 60 * 1000,
    });

    const html = generateEmailVerificationCodeView(code);
    await sendEmail(email, "Mã xác thực tài khoản", { html });

    res.status(201).json({
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác minh.",
      user: { ...userCreated.toObject(), password: undefined },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// [POST] /auth/login
async function login(req, res) {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Email chưa được xác thực." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || "tiendz",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
}

// [POST] /auth/forgot-password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const code = generateVerificationCode();
    user.emailVerifyCode = code;
    user.emailVerifyExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const html = `<p>Mã xác minh đặt lại mật khẩu của bạn là: <strong>${code}</strong></p>`;
    await sendEmail(email, "Mã đặt lại mật khẩu", { html });

    res.json({ message: "Đã gửi mã xác minh tới email của bạn" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// [POST] /auth/reset-password
async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    if (user.emailVerifyCode || user.emailVerifyExpires) {
      return res.status(400).json({ message: "Vui lòng xác minh mã trước khi đổi mật khẩu." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const html = generatePasswordChangedEmail();
    await sendEmail(email, "Mật khẩu của bạn đã được thay đổi", { html });

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// [POST] /auth/email-code
async function verifyEmailCode(req, res) {
  try {
    const { email, code } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user || !user.emailVerifyCode || !user.emailVerifyExpires)
      return res.status(400).json({ message: "Không có mã xác minh đang hoạt động" });

    if (Date.now() > user.emailVerifyExpires)
      return res.status(400).json({ message: "Mã xác minh đã hết hạn" });

    if (user.emailVerifyCode !== code)
      return res.status(400).json({ message: "Mã xác minh không đúng" });

    user.isVerified = true;
    user.emailVerifyCode = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    res.json({ message: "Xác minh tài khoản thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xác minh mã" });
  }
}

// [POST] /auth/email-code/register
async function verifyRegisterCode(req, res) {
  try {
    const { email, code } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (!user.emailVerifyCode || !user.emailVerifyExpires)
      return res.status(400).json({ message: "Không có mã xác minh đang hoạt động" });

    if (Date.now() > user.emailVerifyExpires)
      return res.status(400).json({ message: "Mã xác minh đã hết hạn" });

    if (user.emailVerifyCode !== code)
      return res.status(400).json({ message: "Mã xác minh không đúng" });

    user.isVerified = true;
    user.emailVerifyCode = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    return res.json({ message: "Xác minh tài khoản thành công!" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi xác minh tài khoản" });
  }
}

// [POST] /me/change-password
async function changePassword(req, res) {
  try {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Chưa đăng nhập' });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const html = generatePasswordChangedEmail();
    await sendEmail(user.email, 'Mật khẩu của bạn đã được thay đổi', { html });

    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

// [PUT] /users/:id
async function updateUser(req, res) {
  try {
    const { error } = updateUserSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const updatedData = req.body;

    const user = await UserModel.findByIdAndUpdate(id, updatedData, { new: true });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json({ ...user.toObject(), password: undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// [DELETE] /users/:id
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json({ message: "Xoá người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// [GET] /users
async function getAllUsers(req, res) {
  try {
    let {
      offset = "0",
      limit = "10",
      sortBy = "createdAt",
      order = "desc",
      search,
    } = req.query;

    const offsetNumber = parseInt(offset, 10);
    const limitNumber = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await UserModel.find(filter)
      .select("-password")
      .sort({ [sortBy]: sortOrder })
      .skip(offsetNumber)
      .limit(limitNumber);

    const total = await UserModel.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        offset: offsetNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// [GET] /users/:id
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmailCode,
  verifyRegisterCode,
  changePassword,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
};
