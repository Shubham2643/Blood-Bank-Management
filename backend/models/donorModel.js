import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
  },
  bloodGroup: {
    type: String,
    required: [true, "Blood group is required"],
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [18, "Must be at least 18 years old"],
    max: [65, "Age limit is 65 years"],
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: [true, "Gender is required"],
  },
  weight: {
    type: Number,
    min: [45, "Minimum weight should be 45kg"],
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: {
      type: String,
      required: true,
      match: [/^[1-9][0-9]{5}$/, "Invalid pincode"],
    },
  },
  lastDonationDate: Date,
  donationHistory: [
    {
      donationDate: { type: Date, default: Date.now },
      facility: { type: mongoose.Schema.Types.ObjectId, ref: "facility" },
      bloodGroup: String,
      quantity: { type: Number, default: 1 },
      verified: { type: Boolean, default: false },
    },
  ],
  isEligible: { type: Boolean, default: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  },
  { timestamps: true },
);

donorSchema.pre("save", function (next) {
  if (!this.coordinates || !this.coordinates.lat || !this.coordinates.lng) {
    const city = (this.address?.city || "").trim().toLowerCase();
    if (city.includes("ahmedabad")) {
      const latOffset = (Math.random() - 0.5) * 0.08;
      const lngOffset = (Math.random() - 0.5) * 0.08;
      this.coordinates = {
        lat: 23.0225 + latOffset,
        lng: 72.5714 + lngOffset,
      };
    } else if (city.includes("surat")) {
      const latOffset = (Math.random() - 0.5) * 0.08;
      const lngOffset = (Math.random() - 0.5) * 0.08;
      this.coordinates = {
        lat: 21.1702 + latOffset,
        lng: 72.8311 + lngOffset,
      };
    } else if (city.includes("vadodara") || city.includes("baroda")) {
      const latOffset = (Math.random() - 0.5) * 0.08;
      const lngOffset = (Math.random() - 0.5) * 0.08;
      this.coordinates = {
        lat: 22.3072 + latOffset,
        lng: 73.1812 + lngOffset,
      };
    } else {
      const latOffset = (Math.random() - 0.5) * 0.08;
      const lngOffset = (Math.random() - 0.5) * 0.08;
      this.coordinates = {
        lat: 23.0225 + latOffset,
        lng: 72.5714 + lngOffset,
      };
    }
  }
  next();
});

donorSchema.index({ email: 1 });
donorSchema.index({ bloodGroup: 1 });
donorSchema.index({ "address.city": 1 });

// Virtual for eligibility based on 90-day rule
donorSchema.virtual("eligibilityStatus").get(function () {
  if (!this.lastDonationDate) return true;
  const daysSinceLastDonation = Math.floor(
    (Date.now() - this.lastDonationDate) / (1000 * 60 * 60 * 24),
  );
  return daysSinceLastDonation >= 90;
});

import { socketWatcherPlugin } from "../utils/events.js";

donorSchema.plugin(socketWatcherPlugin);

export default mongoose.model("Donor", donorSchema);
