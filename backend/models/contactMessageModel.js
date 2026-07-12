import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    replyText: {
      type: String,
      required: true,
      trim: true,
    },
    repliedAt: {
      type: Date,
      default: Date.now,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    inquiryType: {
      type: String,
      enum: ["general", "emergency", "donation", "camp", "partnership", "feedback"],
      default: "general",
    },
    replied: {
      type: Boolean,
      default: false,
    },
    replies: [replySchema],
  },
  { timestamps: true }
);

// Index for sorting by date and status
contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ replied: 1 });

import { socketWatcherPlugin } from "../utils/events.js";

contactMessageSchema.plugin(socketWatcherPlugin);

export default mongoose.model("ContactMessage", contactMessageSchema);
