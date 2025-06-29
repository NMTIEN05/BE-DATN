import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../model/User.js";


// Sửa đúng: dùng 2 schema riêng biệt
import { registerSchema, loginSchema } from "../validate/Auth.js";
import { updateUserSchema } from "../validate/User.js";

// [POST] Đăng ký user
async function register(req, res) {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { username,full_name, email, password, phone, address, role } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        username,
      full_name,
      email,
      password: hashedPassword,
      phone,
      address: address || "", // nếu không nhập vẫn có trường
      role: role || "user",
    };

    const userCreated = await UserModel.create(newUser);
    res.json({ ...userCreated.toObject(), password: undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

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
    const users = await UserModel.find().select("-password");
    res.json(users);
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

// [POST] Đăng nhập

async function login(req, res) {
  try {
    // ✅ Validate đầu vào
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // ✅ Tìm user theo email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // ✅ So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // ✅ Tạo JWT token với "userId" để đồng bộ với middleware
const token = jwt.sign(
  { id: user._id.toString(), role: user.role }, // ✅ phải là "id" chứ không phải "userId"
  process.env.JWT_SECRET || "tiendz",
  { expiresIn: "7d" }
);




    // ✅ Trả response
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

export { register, updateUser, getUserById, getAllUsers, login, deleteUser };
