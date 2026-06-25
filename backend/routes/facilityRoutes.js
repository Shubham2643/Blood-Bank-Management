// routes/facilityRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  getFacilityDashboard,
  getAllLabs,
  getFacilityStats,
  getFacilityHistory,
} from "../controllers/facilityController.js";

const router = express.Router();

// Protect all facility routes
router.use(protect);

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Dashboard route
router.get("/dashboard", getFacilityDashboard);

// Statistics route
router.get("/stats", getFacilityStats);

// History route
router.get("/history", getFacilityHistory);

// Labs route (for hospitals to view blood labs)
router.get("/labs", getAllLabs);

export default router;
