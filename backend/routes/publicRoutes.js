import express from "express";
import {
  getPublicStats,
  getEmergencyNeeds,
  getUpcomingCamps,
  getNearbyCamps,
  getPublicHospitals,
  subscribeNewsletter,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/stats", getPublicStats);
router.get("/emergency-needs", getEmergencyNeeds);
router.get("/camps/upcoming", getUpcomingCamps);
router.get("/camps/nearby", getNearbyCamps);
router.get("/hospitals", getPublicHospitals);
router.post("/newsletter", subscribeNewsletter);

export default router;

