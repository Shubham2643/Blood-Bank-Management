import express from "express";
import {
  protectfacility,
  requireFacilityApproved,
  requireFacilityType,
} from "../middlewares/facilityMiddleware.js";
import {
  requestBlood,
  getRequests,
  getDashboard,
  getInventory,
  getDonors,
  contactDonor,
  createDonor,
  updateDonor,
  deleteDonor,
} from "../controllers/hospitalController.js";

const router = express.Router();

router.use(protectfacility, requireFacilityType("hospital"), requireFacilityApproved);

router.post("/blood/request", requestBlood);
router.get("/blood/requests", getRequests);
router.get("/dashboard", getDashboard);
router.get("/blood/stock", getInventory);
router.get("/donors", getDonors);
router.post("/donors", createDonor);
router.put("/donors/:id", updateDonor);
router.delete("/donors/:id", deleteDonor);
router.post("/donors/:id/contact", contactDonor);

export default router;
