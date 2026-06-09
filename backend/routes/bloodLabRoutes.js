import express from "express";
import {
  protectfaculty,
  requireFacultyApproved,
  requireFacultyType,
} from "../middlewares/facultyMiddleware.js";
import {
  createBloodCamp,
  deleteBloodCamp,
  getBloodLabCamps,
  getBloodLabDashboard,
  getBloodLabHistory,
  updateBloodCamp,
  updateCampStatus,
  addBloodStock,
  removeBloodStock,
  getBloodStock,
  updateBloodRequestStatus,
  getLabBloodRequests,
  getAllLabs,
} from "../controllers/bloodLabController.js";
import {
  getRecentDonations,
  markDonation,
  searchDonor,
} from "../controllers/donorController.js";

const router = express.Router();

router.use(protectfaculty, requireFacultyType("blood-lab"), requireFacultyApproved);

router.get("/dashboard", getBloodLabDashboard);
router.get("/history", getBloodLabHistory);
router.post("/camps", createBloodCamp);
router.get("/camps", getBloodLabCamps);
router.put("/camps/:id", updateBloodCamp);
router.patch("/camps/:id/status", updateCampStatus);
router.delete("/camps/:id", deleteBloodCamp);
router.post("/blood/add", addBloodStock);
router.post("/blood/remove", removeBloodStock);
router.get("/blood/stock", getBloodStock);
router.get("/blood/requests", getLabBloodRequests);
router.put("/blood/requests/:id", updateBloodRequestStatus);
router.get("/labs", getAllLabs);
router.get("/donors/search", searchDonor);
router.post("/donors/donate/:id", markDonation);
router.get("/donations/recent", getRecentDonations);

export default router;
