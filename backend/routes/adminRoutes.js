// routes/adminRoutes.js
import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getDashboardStats,
  getAllFaculties,
  getAllDonors,
  approveFaculty,
  rejectFaculty,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, authorize("admin"));

// Dashboard
router.get("/dashboard", getDashboardStats);

// Faculty management
router.get("/faculties", getAllFaculties);
router.put("/faculty/approve/:id", approveFaculty);
router.put("/faculty/reject/:id", rejectFaculty);

// Donor management
router.get("/donors", getAllDonors);

export default router;
