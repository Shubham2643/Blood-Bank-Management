import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  phone: {
    type: String,
    match: [/^[6-9][0-9]{9}$/, "Please enter a valid 10-digit phone number"],
  },
  role: {
    type: String,
    enum: ["donor", "hospital", "blood-lab", "admin"],
    required: true,
  },
  authProvider: {
    type: String,
    enum: ["local", "google", "firebase"],
    default: "local",
  },
  firebaseUid: {
    type: String,
    sparse: true,
    unique: true,
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  avatar: String,
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre("validate", function (next) {
  if (this.authProvider === "local") {
    if (!this.password) {
      this.invalidate("password", "Password is required for local accounts");
    }
    if (!this.phone) {
      this.invalidate("phone", "Phone number is required for local accounts");
    }
  }
  if (this.authProvider === "firebase" && !this.firebaseUid) {
    this.invalidate("firebaseUid", "Firebase UID is required for Firebase accounts");
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.setRandomPassword = function () {
  this.password = crypto.randomBytes(32).toString("hex");
};

export default mongoose.model("User", userSchema);
