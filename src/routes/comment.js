// import express from 'express';
// import {
//   getComments,
//   createComment,
//   updateComment,
//   deleteComment,
// } from '../controllers/comment.js';
// import { verifyToken } from '../middleware/auth.js';

// const router = express.Router();

// /**
//  * Lấy danh sách comment theo productId, có thể kèm parent để lấy reply
//  * [GET] /api/comments/:productId?parent=ID
//  */
// router.get('/comments/:productId', getComments);

// /**
//  * Tạo comment mới cho sản phẩm (yêu cầu đăng nhập)
//  * [POST] /api/comments/:productId
//  */
// router.post('/comments/:productId', verifyToken, createComment);

// /**
//  * Cập nhật comment (yêu cầu đăng nhập)
//  * [PUT] /api/comments/:id
//  */
// router.put('/comments/:id', verifyToken, updateComment);

// /**
//  * Xoá comment (yêu cầu đăng nhập)
//  * [DELETE] /api/comments/:id
//  */
// router.delete('/comments/:id', verifyToken, deleteComment);

// export default router;
