import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getAllNews,
  getNewsById,
  getNewsCategories,
  getBreakingNews,
  likeNews,
  saveNews,
} from "../controllers/newsController.js";

const router = express.Router();

router.get("/categories", getNewsCategories);
router.get("/breaking", getBreakingNews);
router.get("/", getAllNews);
router.get("/:id", getNewsById);

router.post("/:id/like", protect, likeNews);
router.post("/:id/save", protect, saveNews);

export default router;
