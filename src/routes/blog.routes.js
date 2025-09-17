import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from '../controllers/blog.controller.js';
import { blogUpload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/', getAllBlogs);
router.post('/', blogUpload.single('image'), createBlog);
router.get('/:id', getBlogById);
router.put('/:id', blogUpload.single('image'), updateBlog);
router.delete('/:id', deleteBlog);

export default router;
