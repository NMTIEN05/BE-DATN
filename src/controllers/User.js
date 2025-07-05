import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../model/User.js";

import  sendEmail, { generatePasswordChangedEmail }  from "../utils/sendMail.js";
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
 // Tạo mã xác thực
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
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "Email đã được sử dụng." });
      }

      // ✅ Nếu user chưa xác minh → cập nhật mã mới
      const code = generateVerificationCode();
      existingUser.emailVerifyCode = code;
      existingUser.emailVerifyExpires = Date.now() + 15 * 60 * 1000; // 15 phút
      await existingUser.save();

      const html = generateEmailVerificationCodeView(code);
      await sendEmail(email, "Mã xác thực tài khoản", { html });

      return res.status(200).json({
        message:
          "Email đã tồn tại nhưng chưa xác minh. Mã xác thực mới đã được gửi.",
      });
    }

    // ✅ Nếu chưa tồn tại → tạo user mới
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
  // [POST] /auth/verify-email-code
 // ✅ Xác minh mã để đổi mật khẩu
async function verifyEmailCode(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Thiếu email hoặc mã xác minh" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // ✅ Chỉ kiểm tra mã quên mật khẩu
    if (!user.emailResetCode || !user.emailResetExpires) {
      return res.status(400).json({ message: "Không có mã xác minh đang hoạt động" });
    }

    if (Date.now() > user.emailResetExpires) {
      return res.status(400).json({ message: "Mã xác minh đã hết hạn" });
    }

    if (user.emailResetCode !== code) {
      return res.status(400).json({ message: "Mã xác minh không đúng" });
    }

    // Mã hợp lệ → xoá để không dùng lại
    user.emailResetCode = null;
    user.emailResetExpires = null;
    await user.save();

    res.json({ message: "✅ Mã xác minh hợp lệ, cho phép đổi mật khẩu!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xác minh mã" });
  }
}

  // [POST] /auth/login
  async function login(req, res) {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const email = req.body.email?.trim().toLowerCase(); // ✅ Chuẩn hóa
    const password = req.body.password;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email chưa được xác thực. Vui lòng kiểm tra email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || "tiendz",
      { expiresIn: "7d" }
    );

    return res.json({
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
    return res.status(500).json({ message: "Lỗi server khi đăng nhập" });
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
    const { email, newPassword } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    // Cập nhật mật khẩu
    user.password = await bcrypt.hash(newPassword, 10);

    // Xoá mã xác thực nếu còn (phòng trường hợp gọi sót)
    user.emailResetCode = undefined;
    user.emailResetExpires = undefined;

    await user.save();

    console.log("✅ Mật khẩu mới đã được cập nhật cho:", email);

    // Gửi email thông báo
    const html = generatePasswordChangedEmail();
    await sendEmail(email, "Mật khẩu của bạn đã được thay đổi", { html });

    res.json({ message: "Đổi mật khẩu thành công! Vui lòng kiểm tra email." });
  } catch (error) {
    console.error("❌ Lỗi resetPassword:", error);
    res.status(500).json({ message: error.message });
  }
}
async function changePassword(req, res) {
  console.log("🟡 Bắt đầu xử lý đổi mật khẩu");

  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      console.warn("⚠️ Không có userId từ token");
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      console.warn("⚠️ Không tìm thấy user:", userId);
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.warn("⚠️ Mật khẩu cũ không đúng");
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    // Cập nhật mật khẩu
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    // Gửi email thông báo (bọc trong try/catch riêng)
    try {
      const html = generatePasswordChangedEmail();
      console.log("📨 Gửi email đến:", user.email);
      await sendEmail(user.email, "Mật khẩu của bạn đã được thay đổi", { html });
      console.log("✅ Email thông báo đã được gửi");
    } catch (mailError) {
      console.error("❌ Gửi email thất bại:", mailError);
      // Không return lỗi, vì đổi mật khẩu vẫn thành công
    }

    console.log(`✅ Người dùng ${user.email || user._id} đã đổi mật khẩu`);
    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi đổi mật khẩu:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}






  export { register,forgotPassword,changePassword,resetPassword, verifyEmailCode , updateUser, getUserById, getAllUsers, login, deleteUser };
