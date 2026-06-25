// controllers/adminController.js
import Donor from "../models/donorModel.js";
import Facility from "../models/facilityModel.js";
import Blood from "../models/bloodModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import Admin from "../models/adminModel.js";
import ContactMessage from "../models/contactMessageModel.js";
import User from "../models/UserModel.js";
import { AppError } from "../utils/errorHandler.js";
import { getIO } from "../socket/index.js";
import { sendEmail } from "../utils/emailService.js";
import { notifyUser } from "../utils/notification.js";

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
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
      Donor.countDocuments({
        $or: [
          {
            lastDonationDate: {
              $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            },
          },
          { lastDonationDate: { $exists: false } },
        ],
      }),
      Blood.aggregate([
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]).then((result) => result[0]?.total || 0),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: "pending" }),
      BloodCamp.countDocuments({
        status: { $in: ["upcoming", "Upcoming"] },
        date: { $gt: new Date() },
      }),
    ]);

    // Get blood type distribution
    const bloodTypeDistribution = await Blood.aggregate([
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

    // For blood requests, hospitalId stores User._id, so look up user names
    for (const request of recentRequests) {
      let hospitalName = "Unknown Hospital";
      if (request.hospitalId) {
        const hospitalUser = await User.findById(request.hospitalId).select("name").lean();
        hospitalName = hospitalUser?.name || "Unknown Hospital";
      }
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
    const topDonorsRaw = await Donor.aggregate([
      { $match: { "donationHistory.0": { $exists: true } } },
      {
        $project: {
          fullName: 1,
          email: 1,
          user: 1,
          bloodGroup: 1,
          lastDonationDate: 1,
          donationCount: { $size: "$donationHistory" },
        },
      },
      { $sort: { donationCount: -1 } },
      { $limit: 5 },
    ]);

    // Resolve donor names from User model if fullName is missing
    const topDonors = [];
    for (const d of topDonorsRaw) {
      let name = d.fullName;
      if (!name && d.user) {
        const userDoc = await User.findById(d.user).select("name").lean();
        name = userDoc?.name;
      }
      topDonors.push({
        name: name || d.email || "Unknown",
        donations: d.donationCount,
        bloodGroup: d.bloodGroup || "N/A",
        lastDonation: d.lastDonationDate
          ? new Date(d.lastDonationDate).toISOString().split("T")[0]
          : "N/A",
      });
    }

    // Build weekly chart data (last 7 days of donations and requests)
    const now = new Date();
    const dayLabels = [];
    const donationCounts = [];
    const requestCounts = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      dayLabels.push(dayStart.toLocaleDateString("en-US", { weekday: "short" }));

      const [donationCount, requestCount] = await Promise.all([
        Donor.aggregate([
          { $unwind: "$donationHistory" },
          {
            $match: {
              "donationHistory.donationDate": { $gte: dayStart, $lte: dayEnd },
            },
          },
          { $count: "total" },
        ]).then((r) => r[0]?.total || 0),
        BloodRequest.countDocuments({
          createdAt: { $gte: dayStart, $lte: dayEnd },
        }),
      ]);

      donationCounts.push(donationCount);
      requestCounts.push(requestCount);
    }

    // Build dynamic system alerts
    const systemAlerts = [];

    // Check for critically low blood types
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

    if (upcomingCamps > 0) {
      systemAlerts.push({
        id: "upcoming-camps",
        type: "info",
        message: `${upcomingCamps} upcoming blood camp${upcomingCamps > 1 ? "s" : ""} scheduled`,
        severity: "low",
        location: "Events",
      });
    }

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
        },
        bloodTypeDistribution,
        recentActivity: topRecentActivity,
        topDonors,
        chartData: {
          labels: dayLabels,
          donations: donationCounts,
          requests: requestCounts,
        },
        alerts: systemAlerts,
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
        .select("-password -refreshToken"),
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
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password -refreshToken"),
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

export const getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

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
      repliedBy: req.user._id,
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

    res.json({
      success: true,
      message: "Reply sent successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
