import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Tạo thư mục uploads/blogs nếu chưa có
const uploadDir = path.resolve('uploads', 'blogs');
fs.mkdirSync(uploadDir, { recursive: true });

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    cb(null, uniqueName);
  },
});

// Middleware multer
export const blogUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});
