# 🛠️ Các lỗi đã sửa và hướng dẫn chạy dự án

## 📋 Tổng quan
Dự án gồm 3 folder chính:
- **BE-DATN**: Backend API (Node.js + Express + MongoDB)
- **FE-DATN**: Frontend (React + TypeScript + Vite)
- **DATN-ADMIN**: Admin Panel (React + TypeScript + Ant Design)

## 🔧 Các lỗi đã sửa

### 1. BE-DATN (Backend)
✅ **Đã sửa:**
- Thêm multer để xử lý upload file
- Cấu hình static file serving cho uploads
- API banner hoàn chỉnh với CRUD operations
- Route upload ảnh riêng biệt

### 2. FE-DATN (Frontend)
✅ **Đã sửa:**
- Sửa lỗi import axios trong Banner.tsx
- Chuyển từ dữ liệu cứng sang fetch API thực tế
- Thêm error handling và loading states
- Fallback banners khi API lỗi

### 3. DATN-ADMIN (Admin Panel)
✅ **Đã sửa:**
- Cấu hình axios để kết nối backend
- Service banner hoàn chỉnh
- Form upload ảnh thực tế
- Error handling và validation

## 🚀 Cách chạy dự án

### Bước 1: Khởi động Backend
```bash
cd BE-DATN
npm install
npm start
```
Backend sẽ chạy tại: `http://localhost:8888`

### Bước 2: Khởi động Frontend
```bash
cd FE-DATN
npm install
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:5173`

### Bước 3: Khởi động Admin
```bash
cd DATN-ADMIN
npm install
npm run dev
```
Admin sẽ chạy tại: `http://localhost:5174`

## 🔗 API Endpoints

### Banner API
- `GET /api/banners` - Lấy danh sách banner
- `POST /api/banners` - Tạo banner mới
- `PUT /api/banners/:id` - Cập nhật banner
- `DELETE /api/banners/:id` - Xóa banner
- `POST /api/banners/upload` - Upload ảnh

### Test API
- `GET /api/ping` - Kiểm tra kết nối

## 📁 Cấu trúc thư mục

```
webdatn/
├── BE-DATN/                 # Backend
│   ├── src/
│   │   ├── controllers/     # Logic xử lý
│   │   ├── model/          # Database models
│   │   ├── routes/         # API routes
│   │   └── uploads/        # Thư mục lưu ảnh
│   └── index.js            # Entry point
├── FE-DATN/                # Frontend
│   ├── src/
│   │   ├── pages/          # Các trang
│   │   ├── components/     # Components
│   │   ├── api/           # API config
│   │   └── services/      # API services
│   └── package.json
└── DATN-ADMIN/            # Admin Panel
    ├── src/
    │   ├── pages/         # Admin pages
    │   ├── services/      # API services
    │   └── utils/         # Utilities
    └── package.json
```

## 🎯 Tính năng chính

### Banner Management
- ✅ Tạo banner mới với upload ảnh
- ✅ Chỉnh sửa banner
- ✅ Xóa banner
- ✅ Bật/tắt trạng thái
- ✅ Hiển thị real-time trên Frontend

### Upload System
- ✅ Upload ảnh lên server
- ✅ Validation file type (JPG, PNG, WebP)
- ✅ Giới hạn kích thước (2MB)
- ✅ Tự động tạo thư mục uploads

### Error Handling
- ✅ API error handling
- ✅ Loading states
- ✅ Fallback data
- ✅ User-friendly messages

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **Backend không chạy:**
   ```bash
   cd BE-DATN
   npm install
   npm start
   ```

2. **Frontend lỗi import:**
   - Kiểm tra đường dẫn import
   - Chạy `npm install` để cài dependencies

3. **Upload ảnh lỗi:**
   - Kiểm tra thư mục `src/uploads/banners/` có tồn tại
   - Kiểm tra quyền ghi file

4. **CORS error:**
   - Backend đã cấu hình CORS
   - Kiểm tra URL trong axios config

### Test kết nối:
```bash
node test-all-connections.js
```

## 📝 Lưu ý quan trọng

1. **Node.js version:** Dự án yêu cầu Node.js >= 18 (hiện tại đang dùng v16, có thể gây warning)
2. **MongoDB:** Đảm bảo MongoDB đang chạy
3. **Ports:** Kiểm tra ports 8888, 5173, 5174 không bị chiếm
4. **File uploads:** Thư mục uploads sẽ tự động tạo khi chạy

## 🎉 Kết quả

Sau khi sửa, hệ thống sẽ hoạt động như sau:
- Admin có thể thêm/sửa/xóa banner
- Frontend sẽ hiển thị banner từ API thực tế
- Upload ảnh hoạt động bình thường
- Error handling đầy đủ

---

**Chúc bạn sử dụng dự án thành công! 🚀** 