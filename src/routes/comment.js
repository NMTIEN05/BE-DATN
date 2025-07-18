import { Router } from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.js';

import requireAuth from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth); // Tất cả comment yêu cầu đăng nhập

router.get('/:blogId', getComments);        // Lấy danh sách comment
router.post('/:blogId', createComment);     // Tạo mới comment
router.put('/:id', updateComment);          // Sửa comment
router.delete('/:id', deleteComment);       // Xoá comment

export default router;
