import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';

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

    const { username, full_name, email, password, phone, address, province, district, ward, role } = req.body;

    // Kiểm tra email trùng lặp
    const existingUserByEmail = await UserModel.findOne({ email });

    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }
  if (role === "admin") {
      const existingAdmin = await UserModel.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(400).json({ message: "Chỉ được phép tồn tại 1 tài khoản admin." });
      }
    }
    // Kiểm tra phone trùng lặp (chỉ khi có phone)
    if (phone && phone.trim()) {
      const existingUserByPhone = await UserModel.findOne({ phone: phone.trim() });
      if (existingUserByPhone) {
        return res.status(400).json({ message: "Số điện thoại đã được sử dụng." });
      }
    }

    const code = generateVerificationCode();

    // Xử lý trường hợp email đã tồn tại nhưng chưa xác minh
    if (existingUserByEmail && !existingUserByEmail.isVerified) {
      existingUserByEmail.emailVerifyCode = code;
      existingUserByEmail.emailVerifyExpires = Date.now() + 15 * 60 * 1000;
      await existingUserByEmail.save();

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
      phone: phone && phone.trim() ? phone.trim() : undefined,
      address: address || "",
      province: province || "",
      district: district || "",
      ward: ward || "",
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
    console.error('Register error:', error);
    
    // Xử lý lỗi duplicate key
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      let message = '';
      switch (field) {
        case 'email':
          message = `Email ${value} đã được sử dụng.`;
          break;
        case 'phone':
          message = `Số điện thoại ${value} đã được sử dụng.`;
          break;
        case 'username':
          message = `Tên đăng nhập ${value} đã được sử dụng.`;
          break;
        default:
          message = `Dữ liệu ${field} đã tồn tại.`;
      }
      
      return res.status(400).json({ message });
    }
    
    res.status(500).json({ message: "Lỗi server khi đăng ký. Vui lòng thử lại." });
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
    delete req.body.username;
    delete req.body.email;

    const { error } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id } = req.params;
    const updatedData = req.body;
       const targetUser = await UserModel.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
     if (
      targetUser.role === "admin" &&
      updatedData.hasOwnProperty("isActive") &&
      updatedData.role &&
      updatedData.role !== "admin"
    ) {
      return res.status(400).json({
        message:
          "Không thể thay đổi trạng thái khi hạ quyền admin xuống role khác.",
      });
    }

    // Chỉ 1 admin duy nhất
    if (updatedData.role === "admin") {
      const existingAdmin = await UserModel.findOne({ role: "admin" });
      if (existingAdmin && existingAdmin._id.toString() !== id) {
        return res.status(400).json({ message: "Chỉ được phép tồn tại 1 tài khoản admin." });
      }
    }

    // Nếu khóa tài khoản mà không có lý do
    if (updatedData.isActive === false && !updatedData.lockReason) {
      return res.status(400).json({ message: "Vui lòng nhập lý do khóa tài khoản." });
    }

    // Nếu mở lại tài khoản → xóa lý do khóa
    if (updatedData.isActive === true) {
      updatedData.lockReason = "";
    }

    const user = await UserModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.json(userObj);
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
 if (user.role === "admin") {
      return res.status(400).json({ message: "Không thể xoá tài khoản admin" });
    }
    res.json({ message: "Xoá người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// GET /users?role=shipper


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
export async function getShippers(req, res) {
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

    const filter = { role: "shipper" };

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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user); // password đã được ẩn nhờ transform
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// Lấy thông tin user hiện tại
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });

    const user = req.user.toJSON?.() || req.user;
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Lỗi khi lấy user hiện tại:", error);
    res.status(500).json({ message: error.message });
  }
};


// Cập nhật user hiện tại
export const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      context: "query",
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "Người dùng không tồn tại" });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vô hiệu hóa tài khoản hiện tại
export const deleteCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const deletedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
    res.json({ message: "Tài khoản đã bị vô hiệu hóa", user: deletedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
