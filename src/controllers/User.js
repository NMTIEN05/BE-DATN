import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../model/User.js";

import  sendEmail  from "../utils/sendMail.js";
// ✅ Đúng
import { generateEmailVerificationCodeView } from "../views/auth.js";
 // tạo mới nếu chưa có
// Sửa đúng: dùng 2 schema riêng biệt
import { registerSchema, loginSchema } from "../validate/Auth.js";
import { updateUserSchema } from "../validate/User.js";

// [POST] Đăng ký user

// [PUT] Cập nhật user
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

// [DELETE] Xoá user
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ message: "Xoá người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// [GET] Lấy danh sách user
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

    // Lọc theo username hoặc email
    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Query người dùng
    const users = await UserModel.find(filter)
      .select("-password") // Ẩn password
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

// [GET] Lấy user theo ID
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}



  // 🔐 Tạo mã 6 số
  const generateVerificationCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  // [POST] /auth/register
 async function register(req, res) {
    try {
      const { error } = registerSchema.validate(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const { username, full_name, email, password, phone, address, role } =
        req.body;

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const code = generateVerificationCode();

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
        emailVerifyExpires: Date.now() + 15 * 60 * 1000, // 15 phút
      });

      const html = generateEmailVerificationCodeView(code);
      await sendEmail(email, "Mã xác thực tài khoản", { html });

      res.json({
        message: "Đăng ký thành công. Vui lòng kiểm tra email để xác minh.",
        user: { ...userCreated.toObject(), password: undefined },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // [POST] /auth/verify-email-code
   async function verifyEmailCode(req, res) {
    try {
      const { email, code } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

      if (user.isVerified) {
        return res.status(400).json({ message: "Tài khoản đã được xác thực" });
      }

      const isValid =
        user.emailVerifyCode === code &&
        user.emailVerifyExpires &&
        Date.now() < user.emailVerifyExpires;

      if (!isValid) {
        return res
          .status(400)
          .json({ message: "Mã xác thực không đúng hoặc đã hết hạn" });
      }

      user.isVerified = true;
      user.emailVerifyCode = undefined;
      user.emailVerifyExpires = undefined;
      await user.save();

      res.json({ message: "Xác thực email thành công!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // [POST] /auth/login
   async function login(req, res) {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { email, password } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không đúng" });
      }

      if (!user.isVerified) {
        return res
          .status(403)
          .json({ message: "Email chưa được xác thực. Vui lòng kiểm tra email." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không đúng" });
      }

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
 async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const code = generateVerificationCode();
    user.emailResetCode = code;
    user.emailResetExpires = Date.now() + 15 * 60 * 1000; // 15 phút

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
    const { email, code, newPassword } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    // Log debug để kiểm tra
    console.log("🔐 Nhập:", { email, code });
    console.log("🔎 DB:", {
      codeInDB: user.emailResetCode,
      expires: user.emailResetExpires,
      now: Date.now(),
    });

    const isValid =
      user.emailResetCode === code &&
      user.emailResetExpires &&
      Date.now() < user.emailResetExpires;

    if (!isValid) {
      return res.status(400).json({ message: "Mã không hợp lệ hoặc đã hết hạn" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.emailResetCode = undefined;
    user.emailResetExpires = undefined;

    await user.save();

    console.log("✅ Mật khẩu mới đã được cập nhật cho:", email);

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}



  export { register,forgotPassword,resetPassword, verifyEmailCode , updateUser, getUserById, getAllUsers, login, deleteUser };
