const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
} = require('../controllers/banner');

const router = express.Router();

/* Đảm bảo folder uploads/banners tồn tại */
const uploadDir = path.join(__dirname, '..', 'uploads', 'banners');
fs.mkdirSync(uploadDir, { recursive: true });

/* Multer config (2 MB, jpeg/png/webp) */
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Invalid file type'), ok);
  },
});

/* Routes */
router.get('/',  getAllBanners);
router.post('/', upload.single('image'), createBanner);
router.get('/:id', getBannerById);
router.put('/:id', upload.single('image'), updateBanner);
router.delete('/:id', deleteBanner);

module.exports = router;
