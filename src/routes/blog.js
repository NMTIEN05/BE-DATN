const express = require('express');
const multer  = require('multer');
const path    = require('path');
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require('../controllers/blog');

const router = express.Router();

/* Bảo đảm thư mục uploads tồn tại */
const fs = require('fs');
const uploadDir = path.join(__dirname, '..', 'uploads', 'blogs');
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

/* Routes */
router.get('/', getAllBlogs);
router.post('/', upload.single('image'), createBlog);
router.get('/:id', getBlogById);
router.put('/:id', upload.single('image'), updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;
