import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAllNews,
  getNewsById,
  getNewsCategories,
  getBreakingNews,
  likeNews,
  saveNews,
  commentOnNews,
  createNews,
  updateNews,
  deleteNews,
} from "../controllers/newsController.js";

const router = express.Router();

router.get("/categories", getNewsCategories);
router.get("/breaking", getBreakingNews);
router.get("/", getAllNews);
router.get("/:id", getNewsById);

router.post("/:id/like", protect, likeNews);
router.post("/:id/save", protect, saveNews);
router.post("/:id/comment", protect, commentOnNews);

router.post("/create", protect, authorize("admin"), createNews);
router.put("/:id", protect, authorize("admin"), updateNews);
router.delete("/:id", protect, authorize("admin"), deleteNews);

export default router;
