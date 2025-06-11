import express from "express";
import { createCategory, deleteCategory, getCategory, getCategorybyId, updateCategory } from "../controllers/Category.js";


const router = express.Router();  


// Route kiểm tra kết nối từ frontend
router.get("/ping", (req, res) => {
  console.log("Frontend đã kết nối thành công");
  res.json({ message: "Backend kết nối thành công!" });
});

// Route category
router.post("/category", createCategory);
router.get("/category", getCategory);
router.get("/category/:id", getCategorybyId);
router.put("/category/:id", updateCategory);
router.delete("/category/:id", deleteCategory);




export default router;
