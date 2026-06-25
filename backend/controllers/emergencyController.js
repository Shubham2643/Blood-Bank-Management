import mongoose from "mongoose";
import { AppError } from "../utils/errorHandler.js";
import PublicBloodRequest from "../models/publicBloodRequestModel.js";
import { notifyRole } from "../utils/notification.js";

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

    // Persist to DB using the PublicBloodRequest schema
    const newRequest = await PublicBloodRequest.create({
      patientName,
      bloodType,
      units: Number(units),
      hospital,
      city: location,
      contactPerson: contactName,
      phone: contactPhone,
      urgency: urgency || "critical",
      requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000), // Emergency: required within 24 hours
      reason: "Emergency Request from Landing Page",
      additionalInfo: additionalInfo || "",
      status: "active",
    });

    // Broadcast to all connected clients in real-time
    const io = req.app.get("io");
    if (io) {
      io.emit("new-blood-request", newRequest);
    }

    await notifyRole(
      "donor",
      `Emergency: ${bloodType} blood needed urgently at ${hospital}, ${location}`,
      "warning"
    );

    res.status(201).json({
      success: true,
      message: "Emergency request received and broadcasted successfully",
      requestId: newRequest._id,
    });
  } catch (error) {
    next(error);
  }
};


