# 🎯 Hướng dẫn API Địa chỉ - Backend

## 📋 Tổng quan

Backend đã được nâng cấp để hỗ trợ lưu trữ và quản lý thông tin địa chỉ của user:

### ✅ **Đã hoàn thành:**
- ✅ **User Model** - Thêm fields địa chỉ
- ✅ **Register API** - Xử lý địa chỉ khi đăng ký
- ✅ **Validation** - Validate các trường địa chỉ
- ✅ **Location API** - Proxy API tỉnh thành phường xã
- ✅ **Frontend Integration** - Cập nhật để sử dụng backend API

## 🏗️ Cấu trúc mới

### 1. User Model (BE-DATN/src/model/User.js)
```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields
  address: { type: String, default: "" },
  province: { type: String, default: "" },    // Mới
  district: { type: String, default: "" },    // Mới
  ward: { type: String, default: "" },        // Mới
});
```

### 2. Register Controller (BE-DATN/src/controllers/User.js)
```javascript
// Xử lý các trường địa chỉ khi đăng ký
const { username, full_name, email, password, phone, address, province, district, ward, role } = req.body;

const userCreated = await UserModel.create({
  // ... existing fields
  address: address || "",
  province: province || "",
  district: district || "",
  ward: ward || "",
});
```

### 3. Validation Schemas
```javascript
// BE-DATN/src/validate/Auth.js
export const registerSchema = Joi.object({
  // ... existing fields
  address: Joi.string().min(5).messages({
    "string.min": "Địa chỉ phải có ít nhất 5 ký tự nếu nhập",
  }),
  province: Joi.string().allow("").optional(),
  district: Joi.string().allow("").optional(),
  ward: Joi.string().allow("").optional(),
});

// BE-DATN/src/validate/User.js
export const updateUserSchema = Joi.object({
  // ... existing fields
  address: Joi.string().allow("").max(255).optional(),
  province: Joi.string().allow("").optional(),
  district: Joi.string().allow("").optional(),
  ward: Joi.string().allow("").optional(),
});
```

## 🚀 API Endpoints

### 1. Location API (Proxy)
```javascript
// Lấy danh sách tỉnh/thành phố
GET /api/location/provinces

// Lấy chi tiết tỉnh/thành phố
GET /api/location/provinces/:code

// Lấy danh sách quận/huyện theo tỉnh
GET /api/location/provinces/:code/districts

// Lấy chi tiết quận/huyện
GET /api/location/districts/:code

// Lấy danh sách phường/xã theo quận/huyện
GET /api/location/districts/:code/wards

// Lấy chi tiết phường/xã
GET /api/location/wards/:code
```

### 2. Register API (Cập nhật)
```javascript
// Đăng ký user với địa chỉ
POST /api/auth/register
{
  "username": "user123",
  "password": "password123",
  "email": "user@example.com",
  "phone": "0123456789",
  "full_name": "Nguyễn Văn A",
  "address": "123 Đường ABC",
  "province": "79",        // Mã tỉnh
  "district": "760",       // Mã quận/huyện
  "ward": "26734"          // Mã phường/xã
}
```

### 3. User API (Cập nhật)
```javascript
// Cập nhật thông tin user (bao gồm địa chỉ)
PUT /api/users/:id
{
  "full_name": "Nguyễn Văn B",
  "phone": "0987654321",
  "address": "456 Đường XYZ",
  "province": "01",
  "district": "001",
  "ward": "00001"
}
```

## 🔧 Cách sử dụng

### 1. Frontend Integration
```typescript
// FE-DATN/src/services/location.service.ts
const API_BASE_URL = 'http://localhost:8888/api/location';

// Lấy tỉnh/thành phố
const provinces = await locationService.getProvinces();

// Lấy quận/huyện theo tỉnh
const districts = await locationService.getDistricts(provinceCode);

// Lấy phường/xã theo quận/huyện
const wards = await locationService.getWards(districtCode);
```

### 2. Register với địa chỉ
```typescript
// FE-DATN/src/pages/auth/register.tsx
const onSubmit = async (data: FormData) => {
  const { confirmPassword, ...submitData } = data;
  await axios.post(`http://localhost:8888/api/auth/register`, submitData);
};
```

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String,
  password: String,
  email: String,
  phone: String,
  full_name: String,
  address: String,      // Địa chỉ chi tiết
  province: String,     // Mã tỉnh/thành phố
  district: String,     // Mã quận/huyện
  ward: String,         // Mã phường/xã
  role: String,
  isVerified: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Workflow

### 1. User Registration Flow
```
1. User nhập thông tin cơ bản
2. Chọn tỉnh/thành phố → Load quận/huyện
3. Chọn quận/huyện → Load phường/xã
4. Nhập địa chỉ chi tiết
5. Submit form → Backend lưu vào database
```

### 2. API Flow
```
Frontend → Backend Location API → External API (provinces.open-api.vn)
     ↓
Backend Register API → Database (MongoDB)
```

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **Location API không hoạt động**
   - Kiểm tra external API: https://provinces.open-api.vn/api
   - Kiểm tra network connection
   - Kiểm tra CORS settings

2. **Register API lỗi validation**
   - Kiểm tra required fields
   - Kiểm tra format dữ liệu
   - Kiểm tra validation schema

3. **Database không lưu địa chỉ**
   - Kiểm tra User model
   - Kiểm tra register controller
   - Kiểm tra database connection

### Debug
```javascript
// Kiểm tra request body
console.log('Register body:', req.body);

// Kiểm tra user created
console.log('User created:', userCreated);

// Kiểm tra API response
console.log('Location API response:', response.data);
```

## 📈 Performance

- **Caching**: Có thể cache location data
- **Proxy**: Backend proxy external API
- **Validation**: Server-side validation
- **Error handling**: Graceful error handling

## 🔒 Security

- **Input validation**: Validate tất cả input
- **SQL injection**: Mongoose ODM protection
- **XSS protection**: Sanitize input
- **Rate limiting**: Giới hạn API calls

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra console logs
2. Kiểm tra network tab
3. Kiểm tra database
4. Kiểm tra API responses 