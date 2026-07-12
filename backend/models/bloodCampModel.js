import mongoose from "mongoose";

const bloodCampSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "facility",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Camp title is required"],
      trim: true,
    },
    description: String,
    date: {
      type: Date,
      required: [true, "Camp date is required"],
    },
    time: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    location: {
      venue: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: {
        type: String,
        match: [/^[1-9][0-9]{5}$/, "Invalid pincode"],
      },
    },
    expectedDonors: { type: Number, default: 0 },
    actualDonors: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    image: {
      type: String,
    },
    registeredDonors: [
      {
        donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },
        registeredAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

bloodCampSchema.index({ date: 1, status: 1 });
bloodCampSchema.index({ "location.city": 1 });
bloodCampSchema.index({ hospital: 1 });

import { socketWatcherPlugin } from "../utils/events.js";

bloodCampSchema.plugin(socketWatcherPlugin);

export default mongoose.model("BloodCamp", bloodCampSchema);
