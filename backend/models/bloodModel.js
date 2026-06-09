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
      ref: "faculty",
    },
    bloodLab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "faculty",
    },
    status: {
      type: String,
      enum: ["available", "reserved", "expired", "used"],
      default: "available",
    },
  },
  { timestamps: true },
);

bloodSchema.pre("save", function (next) {
  if (!this.expiryDate) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 42);
    this.expiryDate = expiry;
  }
  next();
});

bloodSchema.index({ hospital: 1, bloodGroup: 1, status: 1 });
bloodSchema.index({ bloodLab: 1, bloodGroup: 1, status: 1 });
bloodSchema.index({ expiryDate: 1 });

export default mongoose.model("Blood", bloodSchema);
