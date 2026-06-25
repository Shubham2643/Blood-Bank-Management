import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "facility",
      required: true,
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "facility",
      required: true,
    },
    bloodType: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    units: {
      type: Number,
      required: true,
      min: 1,
    },
    urgency: {
      type: String,
      enum: ["normal", "urgent", "emergency"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    notes: String,
    requestedAt: { type: Date, default: Date.now },
    processedAt: Date,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "facility" },
    geofencedAlerts: {
      donorCount: { type: Number, default: 0 },
      notifiedDonors: [
        {
          name: String,
          phone: String,
          distance: Number,
          notifiedAt: { type: Date, default: Date.now },
        },
      ],
    },
  },
  { timestamps: true },
);

bloodRequestSchema.index({ hospitalId: 1, status: 1 });
bloodRequestSchema.index({ labId: 1, status: 1 });

export default mongoose.model("BloodRequest", bloodRequestSchema);
