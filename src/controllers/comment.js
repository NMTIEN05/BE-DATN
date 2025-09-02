import Comment from '../model/comment.js';

/* ========================== HELPERS ========================== */
function mapComment(c) {
  const base = c.toObject();
  const mapped = { ...base, id: c.id };
  if (c.user) {
    const u = c.user.toObject ? c.user.toObject() : c.user;
    mapped.user = { ...u, id: u?.id || u?._id?.toString?.() };
  }
  if (c.product) {
    const p = c.product.toObject ? c.product.toObject() : c.product;
    mapped.product = { ...p, id: p?.id || p?._id?.toString?.() };
  }
  return mapped;
}

/* ========================== CONTROLLERS ========================== */

/**
 * [GET] /api/comments
 * Liệt kê tất cả comment (phân trang/lọc)
 * query: page, limit, q (search content), star (1..5), productId
 */
export const listAllComments = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const q     = (req.query.q || '').trim();
    const star  = req.query.star ? Number(req.query.star) : undefined;
    const productId = req.query.productId || undefined;

    const filter = {};
    if (q) filter.content = { $regex: q, $options: 'i' };
    if (star && star >= 1 && star <= 5) filter.rating = star;
    if (productId) filter.product = productId;

    const [items, total] = await Promise.all([
      Comment.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'username email')
        .populate('product', 'title slug'),
      Comment.countDocuments(filter),
    ]);

    res.json({
      items: items.map(mapComment),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * [GET] /api/comments/:productId?parent=ID&all=1
 * - mặc định: parent=null => chỉ comment gốc
 * - ?parent=<id> => lấy reply của 1 comment
 * - ?all=1 => bỏ lọc parent, lấy tất cả (gốc + reply)
 */
export const getComments = async (req, res) => {
  try {
    const { productId } = req.params;
    const { parent = null, all } = req.query;

    const query = { product: productId };
    if (!all) {
      query.parent = parent; // parent=null -> comment gốc
    }

    const comments = await Comment.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(comments.map(mapComment));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * [POST] /api/comments/:productId
 * body: { content, parent?, rating? }
 */
export const createComment = async (req, res) => {
  try {
    const { productId } = req.params;
    const { content, parent = null, rating = null } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Nội dung không được để trống' });
    }

    if (rating !== null) {
      const r = Number(rating);
      if (Number.isNaN(r) || r < 1 || r > 5) {
        return res.status(400).json({ message: 'Số sao không hợp lệ. Chỉ từ 1 đến 5.' });
      }
    }

    const comment = await Comment.create({
      product: productId,
      user: req.user.id,
      content: content.trim(),
      parent,
      rating: rating ?? null,
    });

    const populated = await comment.populate('user', 'username email');
    res.status(201).json(mapComment(populated));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

/**
 * [PUT] /api/comments/:id
 * body: { content, rating? }
 * Yêu cầu: chủ comment hoặc admin
 */
export const updateComment = async (req, res) => {
  try {
    const { content, rating = null } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json({ message: 'Không tìm thấy comment' });
    if (!comment.user.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền sửa' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Nội dung không được để trống' });
    }
    comment.content = content.trim();

    if (rating !== null) {
      const r = Number(rating);
      if (Number.isNaN(r) || r < 1 || r > 5) {
        return res.status(400).json({ message: 'Số sao không hợp lệ. Chỉ từ 1 đến 5.' });
      }
      comment.rating = r;
    }

    await comment.save();
    const populated = await comment.populate('user', 'username email');
    res.json(mapComment(populated));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * [DELETE] /api/comments/:id
 * Yêu cầu: chủ comment hoặc admin
 * Xoá kèm toàn bộ reply con
 */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json({ message: 'Không tìm thấy comment' });
    if (!comment.user.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xoá' });
    }

    await Comment.deleteMany({ parent: comment.id }); // xoá reply
    await comment.deleteOne();

    res.json({ message: 'Đã xoá comment thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
