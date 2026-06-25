import mongoose from "mongoose";

const donorResponseSchema = new mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String },
    respondedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const publicBloodRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    bloodType: {
      type: String,
      required: [true, "Blood type is required"],
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    units: {
      type: Number,
      required: [true, "Number of units is required"],
      min: 1,
    },
    hospital: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    urgency: {
      type: String,
      enum: ["normal", "high", "emergency", "critical"],
      default: "normal",
    },
    requiredBy: {
      type: Date,
      required: [true, "Required by date is required"],
    },
    reason: {
      type: String,
      trim: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "fulfilled", "expired", "cancelled"],
      default: "active",
    },
    donorsResponded: [donorResponseSchema],
  },
  { timestamps: true },
);

// Index for fast filtering
publicBloodRequestSchema.index({ bloodType: 1, status: 1 });
publicBloodRequestSchema.index({ city: 1, status: 1 });
publicBloodRequestSchema.index({ urgency: 1, status: 1 });
publicBloodRequestSchema.index({ createdAt: -1 });

export default mongoose.model("PublicBloodRequest", publicBloodRequestSchema);
