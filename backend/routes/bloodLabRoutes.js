import express from "express";
import {
  protectfacility,
  requireFacilityApproved,
  requireFacilityType,
} from "../middlewares/facilityMiddleware.js";
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
  getPendingBags,
  submitTestResults,
  splitWholeBlood,
  getCampRegistrations,
  recordDonationVitals,
} from "../controllers/bloodLabController.js";
import {
  getRecentDonations,
  markDonation,
  searchDonor,
} from "../controllers/donorController.js";

const router = express.Router();

router.use(protectfacility, requireFacilityType("blood-lab"), requireFacilityApproved);

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

// e-Raktkosh testing & camp registrations workflow
router.get("/blood/pending-testing", getPendingBags);
router.post("/blood/submit-test", submitTestResults);
router.post("/blood/split-bag", splitWholeBlood);
router.get("/camps/:id/registrations", getCampRegistrations);
router.post("/camps/:id/record-donation", recordDonationVitals);

export default router;
