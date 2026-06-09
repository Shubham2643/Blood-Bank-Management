import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAllBlogs,
  getBlogById,
  getBlogCategories,
  getPopularBlogs,
  likeBlog,
  commentOnBlog,
  saveBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.get("/categories", getBlogCategories);
router.get("/popular", getPopularBlogs);
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

router.post("/:id/like", protect, likeBlog);
router.post("/:id/comment", protect, commentOnBlog);
router.post("/:id/save", protect, saveBlog);

router.post("/create", protect, authorize("admin"), createBlog);
router.put("/:id", protect, authorize("admin"), updateBlog);
router.delete("/:id", protect, authorize("admin"), deleteBlog);

export default router;
