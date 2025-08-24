import express from 'express';
import {
  getComments,
  listAllComments,   // NEW
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * [GET] /api/comments
 * Liệt kê tất cả comment (phân trang/lọc)
 * query: page, limit, q (search content), star (1..5), productId
 */
router.get('/comments', listAllComments);

/**
 * [GET] /api/comments/:productId?parent=ID&all=1
 * Lấy danh sách comment theo productId
 * - mặc định: parent=null => chỉ comment gốc
 * - ?parent=<id> => lấy reply của 1 comment
 * - ?all=1 => bỏ lọc parent, lấy tất cả (gốc + reply)
 */
router.get('/comments/:productId', getComments);

/**
 * [POST] /api/comments/:productId
 * Tạo comment mới cho sản phẩm (yêu cầu đăng nhập)
 * body: { content, rating?, parent? }
 */
router.post('/comments/:productId', authenticate, createComment);

/**
 * [PUT] /api/comments/:id
 * Cập nhật comment (yêu cầu đăng nhập, chủ comment hoặc admin)
 * body: { content, rating? }
 */
router.put('/comments/:id', authenticate, updateComment);

/**
 * [DELETE] /api/comments/:id
 * Xoá comment (yêu cầu đăng nhập, chủ comment hoặc admin)
 * Xoá kèm toàn bộ reply con
 */
router.delete('/comments/:id', authenticate, deleteComment);

export default router;
