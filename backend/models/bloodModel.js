import mongoose from "mongoose";

const bloodSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "facility",
    },
    bloodLab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "facility",
    },
    status: {
      type: String,
      enum: ["available", "reserved", "expired", "used"],
      default: "available",
    },
    componentType: {
      type: String,
      required: true,
      enum: ["Whole Blood", "Packed Red Blood Cells", "Platelets", "Fresh Frozen Plasma"],
      default: "Whole Blood",
    },
    bagId: {
      type: String,
      required: true,
      unique: true,
    },
    testingStatus: {
      type: String,
      enum: ["pending-test", "safe", "unsafe-discarded"],
      default: "pending-test",
    },
    diseasesTested: {
      hiv: { type: Boolean, default: false },
      hbv: { type: Boolean, default: false },
      hcv: { type: Boolean, default: false },
      malaria: { type: Boolean, default: false },
      syphilis: { type: Boolean, default: false },
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
    },
    healthMetrics: {
      hemoglobin: { type: Number },
      bloodPressure: { type: String },
      pulse: { type: Number },
      temperature: { type: Number },
    },
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

bloodSchema.pre("validate", function (next) {
  if (!this.bagId) {
    const random = Math.floor(10000 + Math.random() * 90000);
    const year = new Date().getFullYear();
    this.bagId = `BB-${year}-${random}`;
  }
  next();
});

bloodSchema.pre("save", function (next) {
  if (!this.expiryDate) {
    const expiry = new Date();
    // Whole Blood / PRBC is 42 days, Platelets is 5 days, FFP is 365 days
    let days = 42;
    if (this.componentType === "Platelets") days = 5;
    else if (this.componentType === "Fresh Frozen Plasma") days = 365;
    
    expiry.setDate(expiry.getDate() + days);
    this.expiryDate = expiry;
  }
  next();
});

bloodSchema.index({ hospital: 1, bloodGroup: 1, status: 1 });
bloodSchema.index({ bloodLab: 1, bloodGroup: 1, status: 1 });
bloodSchema.index({ expiryDate: 1 });
bloodSchema.index({ testingStatus: 1 });

export default mongoose.model("Blood", bloodSchema);
