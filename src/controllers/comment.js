import Comment from '../model/comment.js';

/* [GET] /api/comments/:blogId?parent=ID */
export const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { parent = null } = req.query;

    const comments = await Comment.find({ blog: blogId, parent })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/* [POST] /api/comments/:blogId */
export const createComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, parent = null, rating = null } = req.body;

    // Validate số sao nếu có
    if (rating !== null && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Số sao không hợp lệ. Chỉ từ 1 đến 5.' });
    }

    const comment = await Comment.create({
      blog: blogId,
      user: req.user._id,
      content,
      parent,
      rating,
    });

    const populated = await comment.populate('user', 'username email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

/* [PUT] /api/comments/:id */
export const updateComment = async (req, res) => {
  try {
    const { content, rating = null } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json({ message: 'Không tìm thấy comment' });
    if (!comment.user.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền sửa' });
    }

    comment.content = content;

    // Cập nhật lại số sao nếu có gửi lên
    if (rating !== null) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Số sao không hợp lệ. Chỉ từ 1 đến 5.' });
      }
      comment.rating = rating;
    }

    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/* [DELETE] /api/comments/:id */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json({ message: 'Không tìm thấy comment' });
    if (!comment.user.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xoá' });
    }

    // Xoá cả reply nếu có
    await Comment.deleteMany({ parent: comment._id });
    await comment.deleteOne();

    res.json({ message: 'Đã xoá comment thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
