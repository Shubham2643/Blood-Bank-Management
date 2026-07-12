// routes/adminRoutes.js
import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getDashboardStats,
  getSidebarMetrics,
  getAllFacilities,
  getAllDonors,
  approveFacility,
  rejectFacility,
  getContactMessages,
  replyToContactMessage,
  getAllUsers,
  getUserById,
  toggleUserActive,
  deleteUser,
  getFacilityById,
  updateFacility,
  deleteFacility,
  suspendFacility,
  getDonorById,
  updateDonor,
  toggleDonorEligibility,
  deleteDonor,
  getBloodInventory,
  getBloodInventoryStats,
  updateBloodStatus,
  deleteBloodUnit,
  getAllBloodRequests,
  getPublicBloodRequests,
  updateRequestStatus,
  getAllCamps,
  updateCampStatus,
  deleteCamp,
  getDonationReport,
  getBloodUsageReport,
  getFacilityPerformanceReport,
  getOnlineUsers,
  getAuditLog,
} from "../controllers/adminController.js";

const router = express.Router();

// All routes here are protected and require admin role
router.use(protect, authorize("admin"));

// Dashboard & stats
router.get("/dashboard", getDashboardStats);
router.get("/sidebar-metrics", getSidebarMetrics);

// Contact messages
router.get("/contact-messages", getContactMessages);
router.post("/contact-messages/:id/reply", replyToContactMessage);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/toggle-active", toggleUserActive);
router.delete("/users/:id", deleteUser);

// Facility management
router.get("/facilities", getAllFacilities);
router.get("/facilities/:id", getFacilityById);
router.put("/facilities/:id", updateFacility);
router.delete("/facilities/:id", deleteFacility);
router.put("/facility/approve/:id", approveFacility);
router.put("/facility/reject/:id", rejectFacility);
router.put("/facility/suspend/:id", suspendFacility);

// Donor management
router.get("/donors", getAllDonors);
router.get("/donors/:id", getDonorById);
router.put("/donors/:id", updateDonor);
router.put("/donors/:id/eligibility", toggleDonorEligibility);
router.delete("/donors/:id", deleteDonor);

// Blood Inventory
router.get("/blood-inventory/stats", getBloodInventoryStats);
router.get("/blood-inventory", getBloodInventory);
router.put("/blood-inventory/:id", updateBloodStatus);
router.delete("/blood-inventory/:id", deleteBloodUnit);

// Blood Requests (Hospital & Public)
router.get("/blood-requests", getAllBloodRequests);
router.get("/public-requests", getPublicBloodRequests);
router.put("/blood-requests/:id", updateRequestStatus);

// Camps management
router.get("/camps", getAllCamps);
router.put("/camps/:id/status", updateCampStatus);
router.delete("/camps/:id", deleteCamp);

// Reports & analytics
router.get("/reports/donations", getDonationReport);
router.get("/reports/blood-usage", getBloodUsageReport);
router.get("/reports/facility-performance", getFacilityPerformanceReport);

// System
router.get("/online-users", getOnlineUsers);
router.get("/audit-log", getAuditLog);

export default router;
