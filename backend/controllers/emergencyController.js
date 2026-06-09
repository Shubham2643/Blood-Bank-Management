import mongoose from "mongoose";
import { AppError } from "../utils/errorHandler.js";

export const createEmergencyRequest = async (req, res, next) => {
  try {
    const {
      patientName,
      bloodType,
      units,
      hospital,
      location,
      contactName,
      contactPhone,
      urgency,
      additionalInfo,
    } = req.body;

    if (
      !patientName ||
      !bloodType ||
      !units ||
      !hospital ||
      !location ||
      !contactName ||
      !contactPhone
    ) {
      throw new AppError("Missing required emergency request fields", 400);
    }

    // In this simplified version we don't persist to DB, just echo back a fake id
    const requestId = new mongoose.Types.ObjectId();

    res.status(201).json({
      success: true,
      message: "Emergency request received",
      requestId,
    });
  } catch (error) {
    next(error);
  }
};

