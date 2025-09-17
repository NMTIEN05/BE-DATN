import express from "express";
import { chatTuvan } from "../controllers/ChatGPT.js"; // Đường dẫn đúng theo dự án của bạn

const router = express.Router();

router.post("/tuvan", chatTuvan);

export default router;
