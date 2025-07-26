import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner
} from '../controllers/banner.js';

const router = express.Router();

/* Bảo đảm thư mục uploads tồn tại */
const uploadDir = path.join(process.cwd(), 'src', 'uploads', 'banners');
fs.mkdirSync(uploadDir, { recursive: true });

/* Cấu hình lưu file + validate */
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);       // .jpg, .png …
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },               // 2 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP allowed.'));
  },
});

// Route upload ảnh riêng
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }
    
    const imageUrl = `/uploads/banners/${req.file.filename}`;
    res.json({ 
      message: 'Upload ảnh thành công',
      url: imageUrl 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Lỗi upload ảnh' });
  }
});

router.post('/', upload.single('image'), createBanner);
router.get('/', getAllBanners);
router.get('/:id', getBannerById);
router.put('/:id', upload.single('image'), updateBanner);
router.delete('/:id', deleteBanner);

export default router;
