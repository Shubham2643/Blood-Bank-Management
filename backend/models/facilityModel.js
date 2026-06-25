import mongoose from "mongoose";

const facilitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Facility name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Facility email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
  },
  facilityType: {
    type: String,
    enum: ["hospital", "blood-lab"],
    required: true,
  },
  registrationNumber: {
    type: String,
    required: [true, "Registration number is required"],
    unique: true,
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
  emergencyContact: String,
  FacilityCategory: String,
  contactPerson: String,
  operatingHours: {
    open: { type: String, default: "09:00" },
    close: { type: String, default: "18:00" },
    workingDays: {
      type: [String],
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      default: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
  },
  is24x7: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: Date,
  rejectionReason: String,
  documents: {
    registrationProof: {
      url: String,
      filename: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  },
  history: [
    {
      eventType: {
        type: String,
        enum: [
          "Login",
          "Verification",
          "Stock Update",
          "Blood Camp",
          "Request",
          "Profile Update",
          "Donor Contact",
        ],
      },
      description: String,
      date: { type: Date, default: Date.now },
    },
  ],
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

facilitySchema.pre("save", function (next) {
  if (!this.coordinates || !this.coordinates.lat || !this.coordinates.lng) {
    const city = (this.address?.city || "").trim().toLowerCase();
    if (city.includes("ahmedabad")) {
      const latOffset = (Math.random() - 0.5) * 0.04;
      const lngOffset = (Math.random() - 0.5) * 0.04;
      this.coordinates = {
        lat: 23.0225 + latOffset,
        lng: 72.5714 + lngOffset,
      };
    } else if (city.includes("surat")) {
      const latOffset = (Math.random() - 0.5) * 0.04;
      const lngOffset = (Math.random() - 0.5) * 0.04;
      this.coordinates = {
        lat: 21.1702 + latOffset,
        lng: 72.8311 + lngOffset,
      };
    } else if (city.includes("vadodara") || city.includes("baroda")) {
      const latOffset = (Math.random() - 0.5) * 0.04;
      const lngOffset = (Math.random() - 0.5) * 0.04;
      this.coordinates = {
        lat: 22.3072 + latOffset,
        lng: 73.1812 + lngOffset,
      };
    } else {
      const latOffset = (Math.random() - 0.5) * 0.04;
      const lngOffset = (Math.random() - 0.5) * 0.04;
      this.coordinates = {
        lat: 23.0225 + latOffset,
        lng: 72.5714 + lngOffset,
      };
    }
  }
  next();
});

export default mongoose.model("facility", facilitySchema, "facilities");

