# 🐛 Fix Duplicate Phone Error - Hướng dẫn sửa lỗi

## 📋 **Vấn đề:**
Lỗi "E11000 duplicate key error" khi đăng ký với số điện thoại đã tồn tại.

## 🔧 **Đã sửa:**

### 1. **Cải thiện Validation (BE-DATN/src/validate/Auth.js)**
```javascript
phone: Joi.string()
  .pattern(/^0\d{9}$/)
  .allow("")           // Cho phép rỗng
  .optional()          // Không bắt buộc
  .messages({
    "string.pattern.base": "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số",
  }),
```

### 2. **Cập nhật User Model (BE-DATN/src/model/User.js)**
```javascript
phone: { 
  type: String, 
  required: false,     // Không bắt buộc
  unique: true,        // Unique khi có giá trị
  sparse: true         // Bỏ qua null/undefined
},
```

### 3. **Cải thiện Register Controller (BE-DATN/src/controllers/User.js)**
```javascript
// Kiểm tra phone trùng lặp (chỉ khi có phone)
if (phone && phone.trim()) {
  const existingUserByPhone = await UserModel.findOne({ phone: phone.trim() });
  if (existingUserByPhone) {
    return res.status(400).json({ message: "Số điện thoại đã được sử dụng." });
  }
}

// Lưu phone (chỉ khi có giá trị)
phone: phone && phone.trim() ? phone.trim() : undefined,
```

### 4. **Better Error Handling**
```javascript
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
```

## 🚀 **Cách sử dụng:**

### 1. **Restart Backend:**
```bash
cd BE-DATN
npm start
```

### 2. **Fix Database (nếu cần):**
```bash
# Chạy script fix duplicate phone
cd BE-DATN
node scripts/fix-duplicate-phone.js
```

### 3. **Test đăng ký:**
- Số điện thoại không bắt buộc
- Nếu nhập phone thì phải unique
- Thông báo lỗi rõ ràng

## 📊 **Kết quả:**

### ✅ **Trước khi sửa:**
- Phone bắt buộc
- Lỗi duplicate key khó hiểu
- Không thể đăng ký nếu phone trùng

### ✅ **Sau khi sửa:**
- Phone không bắt buộc
- Thông báo lỗi rõ ràng
- Có thể đăng ký không cần phone
- Validation tốt hơn

## 🔍 **Test Cases:**

### 1. **Đăng ký không có phone:**
```json
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "123456",
  "full_name": "User One"
}
```
**Kết quả:** ✅ Thành công

### 2. **Đăng ký với phone mới:**
```json
{
  "username": "user2",
  "email": "user2@example.com",
  "password": "123456",
  "full_name": "User Two",
  "phone": "0123456789"
}
```
**Kết quả:** ✅ Thành công

### 3. **Đăng ký với phone trùng:**
```json
{
  "username": "user3",
  "email": "user3@example.com",
  "password": "123456",
  "full_name": "User Three",
  "phone": "0123456789"
}
```
**Kết quả:** ❌ "Số điện thoại 0123456789 đã được sử dụng."

## 🐛 **Nếu vẫn lỗi:**

### 1. **Kiểm tra database:**
```bash
# Kết nối MongoDB
mongo web_phone

# Kiểm tra users có phone trùng
db.usermodels.aggregate([
  { $match: { phone: { $exists: true, $ne: null } } },
  { $group: { _id: "$phone", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

### 2. **Chạy script fix:**
```bash
cd BE-DATN
node scripts/fix-duplicate-phone.js
```

### 3. **Restart backend:**
```bash
npm start
```

## 📞 **Support:**

Nếu vẫn có vấn đề:
1. Kiểm tra console logs
2. Kiểm tra database
3. Chạy script fix
4. Restart backend 