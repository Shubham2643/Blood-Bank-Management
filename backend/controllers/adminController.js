// controllers/adminController.js
import Donor from "../models/donorModel.js";
import Facility from "../models/facilityModel.js";
import Blood from "../models/bloodModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import ContactMessage from "../models/contactMessageModel.js";
import User from "../models/UserModel.js";
import AuditLog from "../models/auditLogModel.js";
import PublicBloodRequest from "../models/publicBloodRequestModel.js";
import Notification from "../models/NotificationModel.js";
import { AppError } from "../utils/errorHandler.js";
import { getIO, getOnlineStats, emitToAdmin, SocketEvents } from "../socket/index.js";
import { sendEmail } from "../utils/emailService.js";
import { notifyUser, notifyRole } from "../utils/notification.js";

// Helper function to log audit entries
const logAudit = async (adminId, action, targetType, targetId, details, req) => {
  try {
    const ipAddress = req ? (req.headers["x-forwarded-for"] || req.socket.remoteAddress) : null;
    await AuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const { timeRange = "week" } = req.query;

    const [
      totalDonors,
      totalFacilities,
      pendingFacilities,
      approvedFacilities,
      totalDonations,
      activeDonors,
      totalBloodUnits,
      totalRequests,
      pendingRequests,
      upcomingCamps,
    ] = await Promise.all([
      Donor.countDocuments(),
      Facility.countDocuments(),
      Facility.countDocuments({ status: "pending" }),
      Facility.countDocuments({ status: "approved" }),
      Donor.aggregate([
        { $unwind: "$donationHistory" },
        { $count: "total" },
      ]).then((result) => result[0]?.total || 0),
      Donor.countDocuments({ isEligible: true }),
      Blood.aggregate([
        { $match: { status: "available" } },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]).then((result) => result[0]?.total || 0),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: "pending" }),
      BloodCamp.countDocuments({
        status: "upcoming",
        date: { $gt: new Date() },
      }),
    ]);

    // Get blood type distribution
    const bloodTypeDistribution = await Blood.aggregate([
      { $match: { status: "available" } },
      {
        $group: {
          _id: "$bloodGroup",
          quantity: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get recent activity - combine donors, facilities, and requests into a unified feed
    const [recentDonors, recentFacilities, recentRequests] = await Promise.all([
      Donor.find()
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName email createdAt bloodGroup user"),
      Facility.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email facilityType status createdAt"),
      BloodRequest.find()
        .populate({
          path: "hospitalId",
          select: "name",
        })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Build a unified recent activity feed
    const recentActivity = [];

    for (const donor of recentDonors) {
      const donorName = donor.fullName || donor.user?.name || donor.email || "Unknown Donor";
      recentActivity.push({
        id: donor._id,
        type: "donor",
        action: "New donor registered",
        user: donorName,
        time: donor.createdAt || new Date(),
        status: "success",
      });
    }

    for (const facility of recentFacilities) {
      const actionText =
        facility.status === "approved"
          ? `${facility.facilityType === "hospital" ? "Hospital" : "Blood Lab"} approved`
          : facility.status === "rejected"
            ? `${facility.facilityType === "hospital" ? "Hospital" : "Blood Lab"} rejected`
            : `New ${facility.facilityType === "hospital" ? "hospital" : "blood lab"} registered`;
      recentActivity.push({
        id: facility._id,
        type: "facility",
        action: actionText,
        user: facility.name || facility.email,
        time: facility.createdAt || new Date(),
        status: facility.status === "approved" ? "success" : facility.status === "rejected" ? "warning" : "info",
      });
    }

    for (const request of recentRequests) {
      const hospitalName = request.hospitalId?.name || "Unknown Hospital";
      recentActivity.push({
        id: request._id,
        type: "request",
        action: `Blood request (${request.bloodType}, ${request.units} units) - ${request.status}`,
        user: hospitalName,
        time: request.createdAt,
        status: request.status === "completed" ? "success" : request.status === "rejected" ? "warning" : "info",
      });
    }

    // Sort by time descending and take top 10
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
    const topRecentActivity = recentActivity.slice(0, 10);

    // Get top donors by donation count
    const topDonorsRaw = await Donor.find()
      .populate("user", "name")
      .select("fullName email user bloodGroup lastDonationDate donationHistory")
      .lean();

    const topDonors = topDonorsRaw
      .map((d) => ({
        name: d.fullName || d.user?.name || d.email || "Unknown",
        donations: d.donationHistory?.length || 0,
        bloodGroup: d.bloodGroup || "N/A",
        lastDonation: d.lastDonationDate
          ? new Date(d.lastDonationDate).toISOString().split("T")[0]
          : "N/A",
      }))
      .sort((a, b) => b.donations - a.donations)
      .slice(0, 5);

    // Build weekly chart data (last 7 periods based on timeRange)
    const now = new Date();
    const chartLabels = [];
    const chartDonations = [];
    const chartRequests = [];

    // Trend calculations
    const getPeriodRange = (range, previous = false) => {
      const start = new Date();
      const end = new Date();
      const multiplier = previous ? 2 : 1;
      const prevMultiplier = previous ? 1 : 0;
      
      if (range === "day") {
        start.setTime(start.getTime() - multiplier * 24 * 60 * 60 * 1000);
        if (previous) end.setTime(end.getTime() - prevMultiplier * 24 * 60 * 60 * 1000);
      } else if (range === "week") {
        start.setTime(start.getTime() - multiplier * 7 * 24 * 60 * 60 * 1000);
        if (previous) end.setTime(end.getTime() - prevMultiplier * 7 * 24 * 60 * 60 * 1000);
      } else if (range === "month") {
        start.setTime(start.getTime() - multiplier * 30 * 24 * 60 * 60 * 1000);
        if (previous) end.setTime(end.getTime() - prevMultiplier * 30 * 24 * 60 * 60 * 1000);
      } else { // year
        start.setTime(start.getTime() - multiplier * 365 * 24 * 60 * 60 * 1000);
        if (previous) end.setTime(end.getTime() - prevMultiplier * 365 * 24 * 60 * 60 * 1000);
      }
      return { start, end };
    };

    const currentPeriod = getPeriodRange(timeRange, false);
    const previousPeriod = getPeriodRange(timeRange, true);

    const [
      currDonors, prevDonors,
      currFacilities, prevFacilities,
      currRequests, prevRequests
    ] = await Promise.all([
      Donor.countDocuments({ createdAt: { $gte: currentPeriod.start } }),
      Donor.countDocuments({ createdAt: { $gte: previousPeriod.start, $lt: previousPeriod.end } }),
      Facility.countDocuments({ createdAt: { $gte: currentPeriod.start } }),
      Facility.countDocuments({ createdAt: { $gte: previousPeriod.start, $lt: previousPeriod.end } }),
      BloodRequest.countDocuments({ createdAt: { $gte: currentPeriod.start } }),
      BloodRequest.countDocuments({ createdAt: { $gte: previousPeriod.start, $lt: previousPeriod.end } }),
    ]);

    const getDonationsCount = async (startDate, endDate) => {
      const match = { "donationHistory.donationDate": { $gte: startDate } };
      if (endDate) match["donationHistory.donationDate"].$lt = endDate;
      
      const res = await Donor.aggregate([
        { $unwind: "$donationHistory" },
        { $match: match },
        { $count: "total" }
      ]);
      return res[0]?.total || 0;
    };

    const currDonations = await getDonationsCount(currentPeriod.start);
    const prevDonations = await getDonationsCount(previousPeriod.start, previousPeriod.end);

    const calcTrend = (curr, prev) => {
      if (prev === 0) return curr > 0 ? "+100" : "0";
      const percent = Math.round(((curr - prev) / prev) * 100);
      return `${percent >= 0 ? "+" : ""}${percent}`;
    };

    const trends = {
      donors: calcTrend(currDonors, prevDonors),
      facilities: calcTrend(currFacilities, prevFacilities),
      donations: calcTrend(currDonations, prevDonations),
      requests: calcTrend(currRequests, prevRequests)
    };

    // Load chart data points
    if (timeRange === "day") {
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getTime() - (i + 1) * 4 * 60 * 60 * 1000);
        const end = new Date(now.getTime() - i * 4 * 60 * 60 * 1000);
        chartLabels.push(start.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }));
        
        const [donCount, reqCount] = await Promise.all([
          Donor.aggregate([
            { $unwind: "$donationHistory" },
            { $match: { "donationHistory.donationDate": { $gte: start, $lte: end } } },
            { $count: "total" }
          ]).then(r => r[0]?.total || 0),
          BloodRequest.countDocuments({ createdAt: { $gte: start, $lte: end } })
        ]);
        chartDonations.push(donCount);
        chartRequests.push(reqCount);
      }
    } else if (timeRange === "week") {
      for (let i = 6; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(start.getDate() - i);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        chartLabels.push(start.toLocaleDateString("en-US", { weekday: "short" }));
        
        const [donCount, reqCount] = await Promise.all([
          Donor.aggregate([
            { $unwind: "$donationHistory" },
            { $match: { "donationHistory.donationDate": { $gte: start, $lte: end } } },
            { $count: "total" }
          ]).then(r => r[0]?.total || 0),
          BloodRequest.countDocuments({ createdAt: { $gte: start, $lte: end } })
        ]);
        chartDonations.push(donCount);
        chartRequests.push(reqCount);
      }
    } else if (timeRange === "month") {
      for (let i = 3; i >= 0; i--) {
        const start = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        chartLabels.push(`Week ${4 - i}`);
        
        const [donCount, reqCount] = await Promise.all([
          Donor.aggregate([
            { $unwind: "$donationHistory" },
            { $match: { "donationHistory.donationDate": { $gte: start, $lte: end } } },
            { $count: "total" }
          ]).then(r => r[0]?.total || 0),
          BloodRequest.countDocuments({ createdAt: { $gte: start, $lte: end } })
        ]);
        chartDonations.push(donCount);
        chartRequests.push(reqCount);
      }
    } else { // year
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
        chartLabels.push(start.toLocaleDateString("en-US", { month: "short" }));
        
        const [donCount, reqCount] = await Promise.all([
          Donor.aggregate([
            { $unwind: "$donationHistory" },
            { $match: { "donationHistory.donationDate": { $gte: start, $lte: end } } },
            { $count: "total" }
          ]).then(r => r[0]?.total || 0),
          BloodRequest.countDocuments({ createdAt: { $gte: start, $lte: end } })
        ]);
        chartDonations.push(donCount);
        chartRequests.push(reqCount);
      }
    }

    // Build dynamic system alerts
    const systemAlerts = [];
    const allBloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    const bloodMap = {};
    for (const bt of bloodTypeDistribution) {
      bloodMap[bt._id] = bt.quantity;
    }
    for (const bt of allBloodTypes) {
      const qty = bloodMap[bt] || 0;
      if (qty === 0) {
        systemAlerts.push({
          id: `low-${bt}`,
          type: "critical",
          message: `${bt} blood not available (0 units)`,
          severity: "high",
          location: "Blood Stock",
        });
      } else if (qty < 5) {
        systemAlerts.push({
          id: `low-${bt}`,
          type: "warning",
          message: `${bt} blood running low (${qty} units)`,
          severity: "medium",
          location: "Blood Stock",
        });
      }
    }

    if (pendingFacilities > 0) {
      systemAlerts.push({
        id: "pending-facilities",
        type: "warning",
        message: `${pendingFacilities} facility registration${pendingFacilities > 1 ? "s" : ""} pending approval`,
        severity: "medium",
        location: "Admin",
      });
    }

    if (pendingRequests > 0) {
      systemAlerts.push({
        id: "pending-requests",
        type: "info",
        message: `${pendingRequests} blood request${pendingRequests > 1 ? "s" : ""} awaiting processing`,
        severity: "low",
        location: "Requests",
      });
    }

    // Online Stats
    const onlineStats = getOnlineStats();

    res.json({
      success: true,
      data: {
        overview: {
          totalDonors,
          totalFacilities,
          approvedFacilities,
          pendingFacilities,
          totalDonations,
          activeDonors,
          totalBloodUnits,
          totalRequests,
          pendingRequests,
          upcomingCamps,
          onlineUsers: onlineStats.total,
        },
        bloodTypeDistribution,
        recentActivity: topRecentActivity,
        topDonors,
        chartData: {
          labels: chartLabels,
          donations: chartDonations,
          requests: chartRequests,
        },
        trends,
        alerts: systemAlerts,
        onlineStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all facilities
// @route   GET /api/admin/facilities
// @access  Private/Admin
export const getAllFacilities = async (req, res, next) => {
  try {
    const { status, type, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (type && type !== "all") filter.facilityType = type;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { registrationNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [facilities, total] = await Promise.all([
      Facility.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("user", "name email isActive"),
      Facility.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        facilities,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donors
// @route   GET /api/admin/donors
// @access  Private/Admin
export const getAllDonors = async (req, res, next) => {
  try {
    const { bloodGroup, city, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (bloodGroup && bloodGroup !== "all") filter.bloodGroup = bloodGroup;
    if (city && city !== "all") filter["address.city"] = city;

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [donors, total] = await Promise.all([
      Donor.find(filter)
        .populate("user", "name email isActive")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Donor.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        donors,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve facility
// @route   PUT /api/admin/facility/approve/:id
// @access  Private/Admin
export const approveFacility = async (req, res, next) => {
  const session = global.supportsTransactions ? await Facility.startSession() : null;
  if (session) session.startTransaction();

  try {
    const facility = await Facility.findById(req.params.id).session(session);

    if (!facility) {
      if (session) await session.abortTransaction();
      return next(new AppError("Facility not found", 404));
    }

    if (facility.status === "approved") {
      if (session) await session.abortTransaction();
      return next(new AppError("Facility already approved", 400));
    }

    facility.status = "approved";
    facility.approvedBy = req.user.id;
    facility.approvedAt = new Date();

    facility.history = facility.history || [];
    facility.history.push({
      eventType: "Verification",
      description: "Account approved by admin",
      date: new Date(),
    });

    await facility.save({ session });
    if (session) await session.commitTransaction();

    await notifyUser(
      facility.user,
      "Your facility account has been approved by admin. You can now access the dashboard.",
      "success"
    );

    // Emit Socket Events
    try {
      getIO().to(`user:${facility.user}`).emit(SocketEvents.ACCOUNT_APPROVED || "account-approved", {
        message: "Your account has been approved.",
        facilityId: facility._id,
      });
      emitToAdmin(SocketEvents.ADMIN_STATS_UPDATE, { message: `Facility ${facility.name} approved.` });
    } catch (e) {
      console.warn("Socket emit failed on approval:", e.message);
    }

    await logAudit(req.user.id, "approve_facility", "facility", facility._id, { name: facility.name }, req);

    res.json({
      success: true,
      message: "Facility approved successfully",
      data: facility,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

// @desc    Reject facility
// @route   PUT /api/admin/facility/reject/:id
// @access  Private/Admin
export const rejectFacility = async (req, res, next) => {
  const session = global.supportsTransactions ? await Facility.startSession() : null;
  if (session) session.startTransaction();

  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      if (session) await session.abortTransaction();
      return next(new AppError("Rejection reason is required", 400));
    }

    const facility = await Facility.findById(req.params.id).session(session);

    if (!facility) {
      if (session) await session.abortTransaction();
      return next(new AppError("Facility not found", 404));
    }

    facility.status = "rejected";
    facility.rejectionReason = rejectionReason;
    facility.rejectedBy = req.user.id;
    facility.rejectedAt = new Date();

    facility.history = facility.history || [];
    facility.history.push({
      eventType: "Verification",
      description: `Account rejected: ${rejectionReason}`,
      date: new Date(),
    });

    await facility.save({ session });
    if (session) await session.commitTransaction();

    await notifyUser(
      facility.user,
      `Your facility account request was rejected. Reason: ${rejectionReason}`,
      "warning"
    );

    // Emit Socket Events
    try {
      getIO().to(`user:${facility.user}`).emit(SocketEvents.ACCOUNT_REJECTED || "account-rejected", {
        message: `Your account registration was rejected. Reason: ${rejectionReason}`,
        rejectionReason,
      });
      emitToAdmin(SocketEvents.ADMIN_STATS_UPDATE, { message: `Facility ${facility.name} rejected.` });
    } catch (e) {
      console.warn("Socket emit failed on rejection:", e.message);
    }

    await logAudit(req.user.id, "reject_facility", "facility", facility._id, { name: facility.name, reason: rejectionReason }, req);

    res.json({
      success: true,
      message: "Facility rejected",
      data: facility,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

// @desc    Get contact messages
// @route   GET /api/admin/contact-messages
// @access  Private/Admin
export const getContactMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, type } = req.query;
    const filter = {};

    if (status === "replied") filter.replied = true;
    if (status === "unreplied") filter.replied = false;
    if (type && type !== "all") filter.inquiryType = type;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [messages, total] = await Promise.all([
      ContactMessage.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ContactMessage.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to contact message
// @route   POST /api/admin/contact-messages/:id/reply
// @access  Private/Admin
export const replyToContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;

    if (!replyText || replyText.trim() === "") {
      throw new AppError("Reply text is required", 400);
    }

    const message = await ContactMessage.findById(id);
    if (!message) {
      throw new AppError("Contact message not found", 404);
    }

    message.replies.push({
      replyText,
      repliedAt: new Date(),
      repliedBy: req.user.id,
    });

    message.replied = true;
    await message.save();

    // Send email reply to user
    await sendEmail({
      email: message.email,
      subject: `RE: ${message.subject || "Your inquiry with LifeDrop"}`,
      template: "default",
      data: {
        message: `Hello ${message.name},<br/><br/>An administrator has replied to your message on LifeDrop.<br/><br/><strong>Your original message:</strong><br/>"${message.message}"<br/><br/><strong>Admin response:</strong><br/>"${replyText}"<br/><br/>Best regards,<br/>The LifeDrop Team`,
      },
    });

    await logAudit(req.user.id, "reply_contact_message", "contact", message._id, { subject: message.subject }, req);

    res.json({
      success: true,
      message: "Reply sent successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// NEW CRUD / MANAGEMENT ENDPOINTS
// ==========================================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role && role !== "all") filter.role = role;
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID with profile data
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    let profile = null;
    if (user.role === "donor") {
      profile = await Donor.findOne({ user: user._id }).lean();
    } else if (user.role === "hospital" || user.role === "blood-lab") {
      profile = await Facility.findOne({ user: user._id }).lean();
    }

    res.json({
      success: true,
      data: {
        ...user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private/Admin
export const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.isActive = !user.isActive;
    await user.save();

    // Notify user
    const actionText = user.isActive ? "activated" : "deactivated";
    await notifyUser(
      user._id,
      `Your account has been ${actionText} by an administrator.`,
      user.isActive ? "success" : "warning"
    );

    // Emit Socket event to user
    try {
      getIO().to(`user:${user._id}`).emit("account-status-changed", {
        isActive: user.isActive,
        message: `Your account has been ${actionText} by admin.`,
      });
    } catch (e) {
      console.warn("Socket event failed for account toggle:", e.message);
    }

    await logAudit(req.user.id, "toggle_user_active", "user", user._id, { email: user.email, isActive: user.isActive }, req);

    res.json({
      success: true,
      message: `User account successfully ${actionText}`,
      data: {
        id: user._id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Delete role specific profile
    if (user.role === "donor") {
      await Donor.deleteOne({ user: user._id });
    } else if (user.role === "hospital" || user.role === "blood-lab") {
      await Facility.deleteOne({ user: user._id });
    }

    await User.deleteOne({ _id: user._id });

    await logAudit(req.user.id, "delete_user", "user", user._id, { name: user.name, email: user.email }, req);

    res.json({
      success: true,
      message: "User and associated profile deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single facility by ID
// @route   GET /api/admin/facilities/:id
// @access  Private/Admin
export const getFacilityById = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id).populate("user", "-password");
    if (!facility) {
      return next(new AppError("Facility not found", 404));
    }

    res.json({
      success: true,
      data: facility,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update facility details (admin override)
// @route   PUT /api/admin/facilities/:id
// @access  Private/Admin
export const updateFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!facility) {
      return next(new AppError("Facility not found", 404));
    }

    await logAudit(req.user.id, "update_facility", "facility", facility._id, { name: facility.name }, req);

    res.json({
      success: true,
      message: "Facility updated successfully",
      data: facility,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete facility profile and user
// @route   DELETE /api/admin/facilities/:id
// @access  Private/Admin
export const deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return next(new AppError("Facility not found", 404));
    }

    await User.deleteOne({ _id: facility.user });
    await Facility.deleteOne({ _id: facility._id });

    await logAudit(req.user.id, "delete_facility", "facility", facility._id, { name: facility.name }, req);

    res.json({
      success: true,
      message: "Facility and user deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend approved facility
// @route   PUT /api/admin/facility/suspend/:id
// @access  Private/Admin
export const suspendFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return next(new AppError("Facility not found", 404));
    }

    facility.status = "rejected";
    facility.rejectionReason = "Suspended by Administrator";
    await facility.save();

    await notifyUser(
      facility.user,
      "Your facility account has been suspended by an administrator. Please contact support.",
      "danger"
    );

    // Emit Socket
    try {
      getIO().to(`user:${facility.user}`).emit("account-status-changed", {
        isActive: false,
        message: "Your facility account has been suspended.",
      });
    } catch (e) {
      console.warn("Socket fail:", e.message);
    }

    await logAudit(req.user.id, "suspend_facility", "facility", facility._id, { name: facility.name }, req);

    res.json({
      success: true,
      message: "Facility suspended successfully",
      data: facility,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donor details
// @route   GET /api/admin/donors/:id
// @access  Private/Admin
export const getDonorById = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id).populate("user", "-password");
    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    res.json({
      success: true,
      data: donor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donor details
// @route   PUT /api/admin/donors/:id
// @access  Private/Admin
export const updateDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    await logAudit(req.user.id, "update_donor", "donor", donor._id, { name: donor.fullName }, req);

    res.json({
      success: true,
      message: "Donor details updated successfully",
      data: donor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle donor eligibility
// @route   PUT /api/admin/donors/:id/eligibility
// @access  Private/Admin
export const toggleDonorEligibility = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    donor.isEligible = !donor.isEligible;
    await donor.save();

    await notifyUser(
      donor.user,
      `Your donation eligibility status has been manually set to ${donor.isEligible ? "ELIGIBLE" : "INELIGIBLE"} by admin.`,
      donor.isEligible ? "success" : "warning"
    );

    await logAudit(req.user.id, "toggle_donor_eligibility", "donor", donor._id, { name: donor.fullName, isEligible: donor.isEligible }, req);

    res.json({
      success: true,
      message: `Donor eligibility toggled to ${donor.isEligible}`,
      data: donor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete donor
// @route   DELETE /api/admin/donors/:id
// @access  Private/Admin
export const deleteDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    await User.deleteOne({ _id: donor.user });
    await Donor.deleteOne({ _id: donor._id });

    await logAudit(req.user.id, "delete_donor", "donor", donor._id, { name: donor.fullName }, req);

    res.json({
      success: true,
      message: "Donor and user deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get blood inventory
// @route   GET /api/admin/blood-inventory
// @access  Private/Admin
export const getBloodInventory = async (req, res, next) => {
  try {
    const { bloodGroup, status, componentType, testingStatus, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (bloodGroup && bloodGroup !== "all") filter.bloodGroup = bloodGroup;
    if (status && status !== "all") filter.status = status;
    if (componentType && componentType !== "all") filter.componentType = componentType;
    if (testingStatus && testingStatus !== "all") filter.testingStatus = testingStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bloodUnits, total] = await Promise.all([
      Blood.find(filter)
        .populate("hospital", "name")
        .populate("bloodLab", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Blood.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        bloodUnits,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get blood inventory stats
// @route   GET /api/admin/blood-inventory/stats
// @access  Private/Admin
export const getBloodInventoryStats = async (req, res, next) => {
  try {
    // Total available units by blood group
    const bloodTypeStats = await Blood.aggregate([
      { $match: { status: "available" } },
      { $group: { _id: "$bloodGroup", count: { $sum: "$quantity" } } },
    ]);

    const groupCounts = {};
    ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].forEach((g) => {
      groupCounts[g] = 0;
    });
    bloodTypeStats.forEach((stat) => {
      if (groupCounts[stat._id] !== undefined) {
        groupCounts[stat._id] = stat.count;
      }
    });

    // Expiry in 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringCount = await Blood.countDocuments({
      status: "available",
      expiryDate: { $lte: sevenDaysFromNow, $gt: new Date() },
    });

    // Total counts by status
    const statusStats = await Blood.aggregate([
      { $group: { _id: "$status", count: { $sum: "$quantity" } } },
    ]);

    const statusCounts = {};
    statusStats.forEach((stat) => {
      statusCounts[stat._id] = stat.count;
    });

    // Total units by component
    const componentStats = await Blood.aggregate([
      { $group: { _id: "$componentType", count: { $sum: "$quantity" } } },
    ]);

    const componentCounts = {};
    componentStats.forEach((stat) => {
      componentCounts[stat._id] = stat.count;
    });

    // Critical low (less than 5 units)
    const criticalGroups = Object.keys(groupCounts).filter((g) => groupCounts[g] < 5);

    res.json({
      success: true,
      data: {
        bloodGroups: groupCounts,
        expiringSoon: expiringCount,
        statusDistribution: statusCounts,
        componentDistribution: componentCounts,
        criticalGroups,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blood status
// @route   PUT /api/admin/blood-inventory/:id
// @access  Private/Admin
export const updateBloodStatus = async (req, res, next) => {
  try {
    const { status, testingStatus } = req.body;
    const update = {};
    if (status) update.status = status;
    if (testingStatus) update.testingStatus = testingStatus;

    const blood = await Blood.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!blood) {
      return next(new AppError("Blood unit not found", 404));
    }

    await logAudit(req.user.id, "update_blood_status", "blood", blood._id, { status, testingStatus }, req);

    res.json({
      success: true,
      message: "Blood unit status updated",
      data: blood,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blood unit
// @route   DELETE /api/admin/blood-inventory/:id
// @access  Private/Admin
export const deleteBloodUnit = async (req, res, next) => {
  try {
    const blood = await Blood.findById(req.params.id);
    if (!blood) {
      return next(new AppError("Blood unit not found", 404));
    }

    await Blood.deleteOne({ _id: blood._id });

    await logAudit(req.user.id, "delete_blood_unit", "blood", blood._id, { bagId: blood.bagId }, req);

    res.json({
      success: true,
      message: "Blood unit deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blood requests (hospital to lab)
// @route   GET /api/admin/blood-requests
// @access  Private/Admin
export const getAllBloodRequests = async (req, res, next) => {
  try {
    const { status, urgency, bloodType, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== "all") filter.status = status;
    if (urgency && urgency !== "all") filter.urgency = urgency;
    if (bloodType && bloodType !== "all") filter.bloodType = bloodType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .populate("hospitalId", "name")
        .populate("labId", "name")
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BloodRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public blood requests
// @route   GET /api/admin/public-requests
// @access  Private/Admin
export const getPublicBloodRequests = async (req, res, next) => {
  try {
    const { status, urgency, bloodType, city, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== "all") filter.status = status;
    if (urgency && urgency !== "all") filter.urgency = urgency;
    if (bloodType && bloodType !== "all") filter.bloodType = bloodType;
    if (city) filter.city = { $regex: city, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [requests, total] = await Promise.all([
      PublicBloodRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PublicBloodRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin override blood request status
// @route   PUT /api/admin/blood-requests/:id
// @access  Private/Admin
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let request = await BloodRequest.findById(req.params.id);
    let isPublic = false;

    if (!request) {
      request = await PublicBloodRequest.findById(req.params.id);
      isPublic = true;
    }

    if (!request) {
      return next(new AppError("Request not found", 404));
    }

    request.status = status;
    if (status === "completed" || status === "fulfilled") {
      request.processedAt = new Date();
    }
    await request.save();

    await logAudit(req.user.id, "update_request_status", "request", request._id, { status, isPublic }, req);

    res.json({
      success: true,
      message: "Request status updated successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all camps
// @route   GET /api/admin/camps
// @access  Private/Admin
export const getAllCamps = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [camps, total] = await Promise.all([
      BloodCamp.find(filter)
        .populate("hospital", "name")
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BloodCamp.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        camps,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update camp status
// @route   PUT /api/admin/camps/:id/status
// @access  Private/Admin
export const updateCampStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const camp = await BloodCamp.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!camp) {
      return next(new AppError("Camp not found", 404));
    }

    await logAudit(req.user.id, "update_camp_status", "camp", camp._id, { status }, req);

    res.json({
      success: true,
      message: "Camp status updated successfully",
      data: camp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blood camp
// @route   DELETE /api/admin/camps/:id
// @access  Private/Admin
export const deleteCamp = async (req, res, next) => {
  try {
    const camp = await BloodCamp.findById(req.params.id);
    if (!camp) {
      return next(new AppError("Camp not found", 404));
    }

    await BloodCamp.deleteOne({ _id: camp._id });

    await logAudit(req.user.id, "delete_camp", "camp", camp._id, { title: camp.title }, req);

    res.json({
      success: true,
      message: "Camp deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donation report analytics
// @route   GET /api/admin/reports/donations
// @access  Private/Admin
export const getDonationReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = "month" } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter["donationHistory.donationDate"] = {};
      if (startDate) filter["donationHistory.donationDate"].$gte = new Date(startDate);
      if (endDate) filter["donationHistory.donationDate"].$lte = new Date(endDate);
    }

    // Donation count grouped by time period
    let groupFormat = "%Y-%m";
    if (groupBy === "day") groupFormat = "%Y-%m-%d";
    if (groupBy === "week") groupFormat = "%Y-W%U";

    const trendData = await Donor.aggregate([
      { $unwind: "$donationHistory" },
      {
        $match: filter["donationHistory.donationDate"] 
          ? { "donationHistory.donationDate": filter["donationHistory.donationDate"] } 
          : {}
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$donationHistory.donationDate" } },
          count: { $sum: 1 },
          quantity: { $sum: "$donationHistory.quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Breakdown by blood group
    const groupBreakdown = await Donor.aggregate([
      { $unwind: "$donationHistory" },
      {
        $match: filter["donationHistory.donationDate"] 
          ? { "donationHistory.donationDate": filter["donationHistory.donationDate"] } 
          : {}
      },
      {
        $group: {
          _id: "$donationHistory.bloodGroup",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Top facilities
    const topFacilities = await Donor.aggregate([
      { $unwind: "$donationHistory" },
      {
        $match: filter["donationHistory.donationDate"] 
          ? { "donationHistory.donationDate": filter["donationHistory.donationDate"] } 
          : {}
      },
      {
        $group: {
          _id: "$donationHistory.facility",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Resolve facility names
    const populatedFacilities = [];
    for (const tf of topFacilities) {
      if (tf._id) {
        const fac = await Facility.findById(tf._id).select("name").lean();
        populatedFacilities.push({
          name: fac?.name || "Unknown Facility",
          count: tf.count,
        });
      }
    }

    res.json({
      success: true,
      data: {
        trend: trendData,
        bloodGroups: groupBreakdown,
        facilities: populatedFacilities,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get blood usage analytics
// @route   GET /api/admin/reports/blood-usage
// @access  Private/Admin
export const getBloodUsageReport = async (req, res, next) => {
  try {
    const statusStats = await Blood.aggregate([
      {
        $group: {
          _id: "$status",
          units: { $sum: "$quantity" },
          count: { $sum: 1 },
        },
      },
    ]);

    const distribution = {};
    statusStats.forEach((s) => {
      distribution[s._id] = s.units;
    });

    const requestsTotal = await BloodRequest.countDocuments();
    const requestsCompleted = await BloodRequest.countDocuments({ status: "completed" });
    const fulfillmentRate = requestsTotal > 0 ? Math.round((requestsCompleted / requestsTotal) * 100) : 0;

    res.json({
      success: true,
      data: {
        statusDistribution: distribution,
        fulfillmentRate,
        totalRequests: requestsTotal,
        completedRequests: requestsCompleted,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get facility performance report
// @route   GET /api/admin/reports/facility-performance
// @access  Private/Admin
export const getFacilityPerformanceReport = async (req, res, next) => {
  try {
    const facilities = await Facility.find({ status: "approved" }).select("name facilityType").lean();

    const performanceData = [];
    for (const f of facilities) {
      // Available blood stock
      const stock = await Blood.aggregate([
        { $match: { status: "available", $or: [{ hospital: f._id }, { bloodLab: f._id }] } },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]);

      // Requests made (if hospital)
      const requestsMade = await BloodRequest.countDocuments({ hospitalId: f._id });

      // Requests fulfilled (if lab)
      const requestsFulfilled = await BloodRequest.countDocuments({ labId: f._id, status: "completed" });

      performanceData.push({
        name: f.name,
        type: f.facilityType,
        availableStock: stock[0]?.total || 0,
        requestsMade,
        requestsFulfilled,
      });
    }

    performanceData.sort((a, b) => b.availableStock - a.availableStock);

    res.json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get online users from sockets
// @route   GET /api/admin/online-users
// @access  Private/Admin
export const getOnlineUsers = async (req, res, next) => {
  try {
    const onlineStats = getOnlineStats();
    res.json({
      success: true,
      data: onlineStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get administrative audit logs
// @route   GET /api/admin/audit-log
// @access  Private/Admin
export const getAuditLog = async (req, res, next) => {
  try {
    const { action, targetType, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("admin", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
