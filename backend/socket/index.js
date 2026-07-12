// socket/index.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Facility from "../models/facilityModel.js";
import User from "../models/UserModel.js";
import Donor from "../models/donorModel.js";
import Blood from "../models/bloodModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import ContactMessage from "../models/contactMessageModel.js";
import AuditLog from "../models/auditLogModel.js";
import { dbEventEmitter } from "../utils/events.js";

let io;

/**
 * Initialize Socket.io server
 * @param {http.Server} server - HTTP server instance
 * @returns {Socket.io.Server} Socket.io server instance
 */
export const initializeSocket = (server) => {
  const origins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: origins,
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25001,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(
      `✅ New socket connection: ${socket.id} (User: ${socket.userId})`,
    );

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Join role-based room
    if (socket.userRole) {
      socket.join(`role:${socket.userRole}`);
    }

    // Join facility room if applicable
    if (socket.userRole === "hospital" || socket.userRole === "blood-lab") {
      socket.join(`facility:${socket.userId}`);
    }

    // Handle joining specific rooms
    socket.on("join-room", (room) => {
      socket.join(room);
      console.log(`User ${socket.userId} joined room: ${room}`);
    });

    socket.on("leave-room", (room) => {
      socket.leave(room);
      console.log(`User ${socket.userId} left room: ${room}`);
    });

    // Handle blood camp registration
    socket.on("register-camp", (data) => {
      const { campId } = data;
      socket.join(`camp:${campId}`);
      console.log(`User ${socket.userId} joined camp room: camp:${campId}`);
    });

    // Handle blood request tracking
    socket.on("track-request", (requestId) => {
      socket.join(`request:${requestId}`);
      console.log(`User ${socket.userId} tracking request: ${requestId}`);
    });

    // Handle typing indicators (for chat if implemented)
    socket.on("typing", (data) => {
      socket.to(data.room).emit("user-typing", {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // Handle read receipts
    socket.on("mark-read", (data) => {
      socket.to(data.room).emit("messages-read", {
        userId: socket.userId,
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} (Reason: ${reason})`);

      // Leave all rooms (automatic, but we can log it)
      console.log(`User ${socket.userId} left all rooms`);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  // Admin namespace for administrative real-time updates
  const adminNamespace = io.of("/admin");

  adminNamespace.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== "admin") {
        return next(new Error("Admin access required"));
      }

      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  adminNamespace.on("connection", (socket) => {
    console.log(`✅ Admin connected: ${socket.id}`);

    // Join admin to all admin rooms
    socket.join("admin:overview");
    socket.join(`admin:${socket.userId}`);

    socket.on("disconnect", () => {
      console.log(`❌ Admin disconnected: ${socket.id}`);
    });
  });

  // Public namespace for unauthenticated updates
  const publicNamespace = io.of("/public");

  publicNamespace.on("connection", (socket) => {
    console.log(`✅ Public connection: ${socket.id}`);

    // Allow joining public rooms like camp updates
    socket.on("join-camp-updates", (campId) => {
      socket.join(`camp-public:${campId}`);
    });

    socket.on("leave-camp-updates", (campId) => {
      socket.leave(`camp-public:${campId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Public connection disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get Socket.io instance
 * @returns {Socket.io.Server} Socket.io server instance
 * @throws {Error} If socket not initialized
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  }
  return io;
};

/**
 * Emit event to specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToUser = (userId, event, data) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit event to all users with specific role
 * @param {string} role - User role
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToRole = (role, event, data) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  io.to(`role:${role}`).emit(event, data);
};

/**
 * Emit event to specific facility
 * @param {string} facilityId - Facility ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToFacility = (facilityId, event, data) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  io.to(`facility:${facilityId}`).emit(event, data);
};

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToAll = (event, data) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  io.emit(event, data);
};

/**
 * Emit event to admin namespace
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToAdmin = (event, data) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  io.of("/admin").emit(event, data);
};

/**
 * Broadcast camp lifecycle events to donors, labs, hospitals, and public clients.
 */
export const broadcastCampEvent = (event, payload = {}) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }

  io.to("role:donor").emit(event, payload);
  io.to("role:blood-lab").emit(event, payload);
  io.to("role:hospital").emit(event, payload);

  const facilityId = payload.facilityId || payload.hospitalId;
  if (facilityId) {
    io.to(`facility:${facilityId}`).emit(event, payload);
  }

  io.of("/public").emit(event, payload);
};

/**
 * Get online users count
 * @returns {Object} Online users statistics
 */
export const getOnlineStats = () => {
  if (!io) {
    return { total: 0, byRole: {} };
  }

  const rooms = io.sockets.adapter.rooms;
  const userRooms = Array.from(rooms.keys()).filter((room) =>
    room.startsWith("user:"),
  );
  const roleRooms = Array.from(rooms.keys()).filter((room) =>
    room.startsWith("role:"),
  );

  const byRole = {};
  roleRooms.forEach((room) => {
    const role = room.replace("role:", "");
    const count = rooms.get(room)?.size || 0;
    byRole[role] = count;
  });

  return {
    total: userRooms.length,
    byRole,
  };
};

/**
 * Socket event types (for reference)
 */
export const SocketEvents = {
  // Blood request events
  NEW_REQUEST: "new-request",
  REQUEST_PROCESSED: "request-processed",
  REQUEST_UPDATED: "request-updated",

  // Blood stock events
  STOCK_UPDATED: "stock-updated",
  STOCK_WARNING: "stock-warning",
  STOCK_EXPIRING: "stock-expiring",

  // Camp events
  NEW_CAMP: "new-camp",
  CAMP_UPDATED: "camp-updated",
  CAMP_REGISTRATION: "camp-registration",
  CAMP_COMPLETED: "camp-completed",
  CAMP_DELETED: "camp-deleted",

  // Donation events
  DONATION_MADE: "donation-made",
  DONATION_VERIFIED: "donation-verified",

  // User events
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  ACCOUNT_APPROVED: "account-approved",
  ACCOUNT_REJECTED: "account-rejected",

  // Notification events
  NOTIFICATION: "notification",
  ALERT: "alert",

  // Admin events
  ADMIN_STATS_UPDATE: "admin-stats-update",
  ADMIN_ALERT: "admin-alert",
  NEW_FACILITY_REGISTRATION: "new-facility-registration",
  NEW_DONOR_REGISTRATION: "new-donor-registration",
  NEW_BLOOD_REQUEST: "new-blood-request",
};

/**
 * Query stats for every admin panel sidebar menu option
 */
export const getSidebarMetricsData = async () => {
  try {
    const [
      pendingFacilities,
      totalUsers,
      totalDonors,
      totalFacilities,
      totalBloodUnits,
      pendingRequests,
      upcomingCamps,
      unreadMessages,
      totalAuditLogs,
    ] = await Promise.all([
      Facility.countDocuments({ status: "pending" }),
      User.countDocuments(),
      Donor.countDocuments(),
      Facility.countDocuments(),
      Blood.aggregate([
        { $match: { status: "available" } },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]).then((result) => result[0]?.total || 0),
      BloodRequest.countDocuments({ status: "pending" }),
      BloodCamp.countDocuments({
        status: "upcoming",
        date: { $gt: new Date() },
      }),
      ContactMessage.countDocuments({ replied: false }),
      AuditLog.countDocuments(),
    ]);

    return {
      verification: pendingFacilities,
      users: totalUsers,
      donors: totalDonors,
      facilities: totalFacilities,
      bloodInventory: totalBloodUnits,
      bloodRequests: pendingRequests,
      camps: upcomingCamps,
      messages: unreadMessages,
      reports: totalAuditLogs,
    };
  } catch (err) {
    console.error("Error fetching sidebar metrics data:", err);
    return {
      verification: 0,
      users: 0,
      donors: 0,
      facilities: 0,
      bloodInventory: 0,
      bloodRequests: 0,
      camps: 0,
      messages: 0,
      reports: 0,
    };
  }
};

/**
 * Broadcast metrics to all admin socket clients (in room role:admin and namespace /admin)
 */
export const broadcastSidebarMetrics = async () => {
  if (!io) return;
  try {
    const metrics = await getSidebarMetricsData();
    emitToRole("admin", "admin-sidebar-metrics", metrics);
    io.of("/admin").emit("admin-sidebar-metrics", metrics);
  } catch (error) {
    console.error("Failed to broadcast sidebar metrics:", error);
  }
};

// Debounce helper to prevent database spam from rapid mutations
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const debouncedBroadcast = debounce(broadcastSidebarMetrics, 500);

// Subscribe to global database changes
dbEventEmitter.on("change", () => {
  debouncedBroadcast();
});

export default {
  initializeSocket,
  getIO,
  emitToUser,
  emitToRole,
  emitToFacility,
  emitToAll,
  emitToAdmin,
  broadcastCampEvent,
  getOnlineStats,
  SocketEvents,
  getSidebarMetricsData,
  broadcastSidebarMetrics,
};
