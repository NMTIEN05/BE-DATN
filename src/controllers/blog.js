const path       = require('path');
const Blog       = require('./blog.model');
const { removeFile } = require('../utils/file.utils');

/* Tạo mới */
exports.createBlog = async (req, res, next) => {
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
exports.getAllBlogs = async (_req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    next(err);
  }
};

/* Lấy một bài */
exports.getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Not found' });
    res.json(blog);
  } catch (err) {
    next(err);
  }
};

/* Cập nhật – xoá ảnh cũ nếu có tải ảnh mới */
exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Not found' });

    // Lưu lại đường dẫn ảnh cũ (nếu có)
    const oldImage = blog.imageUrl;

    // Cập nhật các trường được phép
    const fields = ['largeTitle', 'smallTitle', 'description', 'content', 'author'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) blog[f] = req.body[f];
    });

    if (req.file) {
      blog.imageUrl = `/uploads/blogs/${req.file.filename}`;
    }

    await blog.save();

    // Nếu có ảnh mới → xoá ảnh cũ
    if (req.file && oldImage) {
      removeFile(oldImage).catch(console.error);
    }

    res.json(blog);
  } catch (err) {
    next(err);
  }
};

/* Xoá bài & file ảnh kèm theo */
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Not found' });

    // Xoá file ảnh nếu có
    if (blog.imageUrl) {
      removeFile(blog.imageUrl).catch(console.error);
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};
