import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createEmergencyRequest } from "../controllers/emergencyController.js";

const router = express.Router();

router.post("/requests", protect, createEmergencyRequest);

export default router;

