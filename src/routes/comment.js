import { Router } from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.js';

import { authenticate } from '../middlewares/auth.js'; // ✅ Import đúng middleware tên là authenticate

const router = Router();

// ✅ Chỉ những người dùng có token mới thao tác được với comment
router.use(authenticate); 

router.get('/:blogId', getComments);        // Lấy tất cả comment của 1 blog
router.post('/:blogId', createComment);     // Thêm comment vào blog
router.put('/:id', updateComment);          // Sửa comment
router.delete('/:id', deleteComment);       // Xoá comment

export default router;
