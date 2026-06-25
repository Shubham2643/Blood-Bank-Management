import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// GET /api/user/notifications
router.get("/notifications", protect, getUserNotifications);

// PUT /api/user/notifications/:id/read
router.put("/notifications/:id/read", protect, markAsRead);

// PUT /api/user/notifications/read-all
router.put("/notifications/read-all", protect, markAllAsRead);

// POST /api/user/save-camp
router.post("/save-camp", protect, async (req, res) => {
  res.json({ success: true, message: "Camp saved successfully" });
});

// GET /api/user/export-data?format=json|csv|pdf
router.get("/export-data", protect, async (req, res) => {
  const format = req.query.format || "json";

  const content =
    format === "csv"
      ? "key,value\nname,LifeDrop\n"
      : format === "pdf"
        ? "PDF export is not implemented in mock mode."
        : JSON.stringify({ message: "Mock export data" }, null, 2);

  const contentType =
    format === "csv"
      ? "text/csv"
      : format === "pdf"
        ? "application/pdf"
        : "application/json";

  res.setHeader("Content-Type", contentType);
  res.status(200).send(content);
});

// DELETE /api/user/delete-data
router.delete("/delete-data", protect, async (req, res) => {
  res.json({
    success: true,
    message: "Deletion request submitted",
  });
});

export default router;


