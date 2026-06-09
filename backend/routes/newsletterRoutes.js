import express from "express";
import { subscribeNewsletter } from "../controllers/publicController.js";

const router = express.Router();

// POST /api/newsletter/subscribe
router.post("/newsletter/subscribe", subscribeNewsletter);

export default router;

