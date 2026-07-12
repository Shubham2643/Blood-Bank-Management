import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["user", "facility", "donor", "blood", "camp", "request", "contact", "system"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
auditLogSchema.index({ admin: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ targetType: 1 });
auditLogSchema.index({ createdAt: -1 });

import { socketWatcherPlugin } from "../utils/events.js";

auditLogSchema.plugin(socketWatcherPlugin);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
