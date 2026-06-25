import express from "express";
import {
  getDonorCamps,
  getDonorHistory,
  getDonorProfile,
  getDonorStats,
  updateDonorProfile,
  registerForCamp,
  getDonationCertificate,
  simulateCampDonation,
  getDonationJourney,
  getDonationHealthReport,
} from "../controllers/donorController.js";
import { protectDonor } from "../middlewares/donorMiddleware.js";


const router = express.Router();

router.get("/profile", protectDonor, getDonorProfile);

router.put("/profile", protectDonor, updateDonorProfile);

router.get("/camps", protectDonor, getDonorCamps);

router.post("/camps/:id/register", protectDonor, registerForCamp);

router.post("/camps/:id/simulate-donation", protectDonor, simulateCampDonation);

router.get("/history", protectDonor, getDonorHistory);

router.get("/stats", protectDonor, getDonorStats);

router.get("/certificate/:donationId", protectDonor, getDonationCertificate);

router.get("/donation/:donationId/journey", protectDonor, getDonationJourney);

router.get("/health-report/:donationId", protectDonor, getDonationHealthReport);

export default router;

