// routes/adminRoutes.js
import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getDashboardStats,
  getAllFacilities,
  getAllDonors,
  approveFacility,
  rejectFacility,
  getContactMessages,
  replyToContactMessage,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, authorize("admin"));

// Dashboard
router.get("/dashboard", getDashboardStats);

// Facility management
router.get("/facilities", getAllFacilities);
router.put("/facility/approve/:id", approveFacility);
router.put("/facility/reject/:id", rejectFacility);

// Donor management
router.get("/donors", getAllDonors);

// Contact messages
router.get("/contact-messages", getContactMessages);
router.post("/contact-messages/:id/reply", replyToContactMessage);

export default router;
