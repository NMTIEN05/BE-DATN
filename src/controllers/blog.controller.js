import Blog from '../model/blog.model.js';
import { removeFile } from '../utils/file.utils.js'; // Giả sử bạn có hàm này đã xử lý fs.unlink

/* Tạo mới */
export const createBlog = async (req, res, next) => {
  try {
    const {
      largeTitle,
      smallTitle,
      description,
      content,
      author,
    } = req.body;

    const imageUrl = req.file
      ? `/uploads/blogs/${req.file.filename}`
      : undefined;

    const blog = await Blog.create({
      largeTitle,
      smallTitle,
      description,
      content,
      author,
      imageUrl,
    });

    res.status(201).json(blog);
  } catch (err) {
    next(err);
  }
};

/* Lấy danh sách */
export const getAllBlogs = async (_req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    next(err);
  }
};

/* Lấy một bài */
export const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Not found' });
    res.json(blog);
  } catch (err) {
    next(err);
  }
};

/* Cập nhật */
export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Not found' });

    const oldImage = blog.imageUrl;

    const fields = ['largeTitle', 'smallTitle', 'description', 'content', 'author'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) blog[f] = req.body[f];
    });

    if (req.file) {
      blog.imageUrl = `/uploads/blogs/${req.file.filename}`;
    }

    await blog.save();

    if (req.file && oldImage) {
      removeFile(oldImage).catch(console.error);
    }

    res.json(blog);
  } catch (err) {
    next(err);
  }
};

/* Xoá */
export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Not found' });

    if (blog.imageUrl) {
      removeFile(blog.imageUrl).catch(console.error);
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};
