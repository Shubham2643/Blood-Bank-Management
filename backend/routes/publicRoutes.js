import express from "express";
import {
  getPublicStats,
  getEmergencyNeeds,
  getUpcomingCamps,
  getNearbyCamps,
  getPublicHospitals,
  subscribeNewsletter,
  getBloodRequests,
  postBloodRequest,
  respondToBloodRequest,
  getCentralStock,
  postContactMessage,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/stats", getPublicStats);
router.get("/emergency-needs", getEmergencyNeeds);
router.get("/camps/upcoming", getUpcomingCamps);
router.get("/camps/nearby", getNearbyCamps);
router.get("/hospitals", getPublicHospitals);
router.post("/newsletter", subscribeNewsletter);
router.post("/contact", postContactMessage);

// Public blood requests
router.get("/blood-requests", getBloodRequests);
router.post("/blood-requests", postBloodRequest);
router.post("/blood-requests/:id/respond", respondToBloodRequest);

// Central Live Stock Directory
router.get("/blood-stock", getCentralStock);

export default router;


