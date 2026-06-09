import express from "express";
import {
  protectfaculty,
  requireFacultyApproved,
  requireFacultyType,
} from "../middlewares/facultyMiddleware.js";
import {
  requestBlood,
  getRequests,
  getDashboard,
  getInventory,
  getDonors,
  contactDonor,
} from "../controllers/hospitalController.js";

const router = express.Router();

router.use(protectfaculty, requireFacultyType("hospital"), requireFacultyApproved);

router.post("/blood/request", requestBlood);
router.get("/blood/requests", getRequests);
router.get("/dashboard", getDashboard);
router.get("/blood/stock", getInventory);
router.get("/donors", getDonors);
router.post("/donors/:id/contact", contactDonor);

export default router;
