import Comment from '../model/comment.js';

/* [GET] /api/comments/:productId?parent=ID */
export const getComments = async (req, res) => {
  try {
    const { productId } = req.params;
    const { parent = null } = req.query;

    const comments = await Comment.find({ product: productId, parent })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    // Chuyển _id -> id (comment + user)
    const formatted = comments.map(comment => ({
      ...comment.toObject(),
      id: comment.id,
      user: {
        ...comment.user.toObject(),
        id: comment.user.id,
      },
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/* [POST] /api/comments/:productId */
export const createComment = async (req, res) => {
  try {
    const { productId } = req.params;
    const { content, parent = null, rating = null } = req.body;

    if (rating !== null && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Số sao không hợp lệ. Chỉ từ 1 đến 5.' });
    }

    const comment = await Comment.create({
      product: productId,
      user: req.user.id,
      content,
      parent,
      rating,
    });

    const populated = await comment.populate('user', 'username email');

    const formatted = {
      ...populated.toObject(),
      id: populated.id,
      user: {
        ...populated.user.toObject(),
        id: populated.user.id,
      },
    };

    res.status(201).json(formatted);
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
    if (!comment.user.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền sửa' });
    }

    comment.content = content;

    if (rating !== null) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Số sao không hợp lệ. Chỉ từ 1 đến 5.' });
      }
      comment.rating = rating;
    }

    await comment.save();

    const formatted = {
      ...comment.toObject(),
      id: comment.id,
    };

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/* [DELETE] /api/comments/:id */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json({ message: 'Không tìm thấy comment' });
    if (!comment.user.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xoá' });
    }

    await Comment.deleteMany({ parent: comment.id });
    await comment.deleteOne();

    res.json({ message: 'Đã xoá comment thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
