// controllers/facilityController.js
import Facility from "../models/facilityModel.js";
import User from "../models/UserModel.js";
import Blood from "../models/bloodModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
import Donor from "../models/donorModel.js";
import { AppError } from "../utils/errorHandler.js";
import { getIO } from "../socket/index.js";

// @desc    Get facility profile
// @route   GET /api/facility/profile
// @access  Private/Facility
export const getProfile = async (req, res, next) => {
  try {
    const facility = await Facility.findOne({
      user: req.user._id || req.user.id,
    })
      .populate("user", "name email phone")
      .select("-password -refreshToken");

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

// @desc    Update facility profile
// @route   PUT /api/facility/profile
// @access  Private/Facility
export const updateProfile = async (req, res, next) => {
  const session = global.supportsTransactions ? await Facility.startSession() : null;
  if (session) session.startTransaction();

  try {
    const updates = req.body;
    const allowedUpdates = [
      "name",
      "phone",
      "emergencyContact",
      "FacilityCategory",
      "contactPerson",
      "operatingHours",
      "address",
      "description",
    ];

    // Filter updates
    const filteredUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Update base User fields (name/phone/password) if provided
    const userUpdates = {};
    if (typeof updates.name === "string" && updates.name.trim()) {
      userUpdates.name = updates.name.trim();
    }
    if (typeof updates.phone === "string" && updates.phone.trim()) {
      userUpdates.phone = updates.phone.trim();
    }
    if (typeof updates.password === "string" && updates.password.trim().length >= 6) {
      userUpdates.password = updates.password;
    }

    if (Object.keys(userUpdates).length > 0) {
      const userId = req.user._id || req.user.id;
      const user = await User.findById(userId).select("+password").session(session);
      if (user) {
        if (userUpdates.name) user.name = userUpdates.name;
        if (userUpdates.phone) user.phone = userUpdates.phone;
        if (userUpdates.password) user.password = userUpdates.password;
        await user.save({ session });
      }
    }

    const facility = await Facility.findOneAndUpdate(
      { user: req.user._id || req.user.id },
      {
        ...filteredUpdates,
        $push: {
          history: {
            eventType: "Profile Update",
            description: "Profile information updated",
            date: new Date(),
          },
        },
      },
      { new: true, runValidators: true, session },
    ).select("-password");

    if (session) await session.commitTransaction();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: facility,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

// @desc    Get facility dashboard
// @route   GET /api/facility/dashboard
// @access  Private/Facility
export const getFacilityDashboard = async (req, res, next) => {
  try {
    const facilityId = req.user._id || req.user.id;
    const facility = await Facility.findById(facilityId);

    if (!facility) {
      return next(new AppError("Facility not found", 404));
    }

    let dashboardData = {
      profile: {
        name: facility.name,
        email: facility.email,
        phone: facility.phone,
        address: facility.address,
        type: facility.facilityType,
        status: facility.status,
        lastLogin: facility.lastLogin,
      },
    };

    // Get facility-specific data based on type
    if (facility.facilityType === "blood-lab") {
      // Blood lab dashboard
      const [bloodStock, pendingRequests, recentCamps] = await Promise.all([
        Blood.find({ bloodLab: facilityId }).sort({ bloodGroup: 1 }),
        BloodRequest.countDocuments({ labId: facilityId, status: "pending" }),
        BloodCamp.find({ hospital: facilityId }).sort({ date: -1 }).limit(5),
      ]);

      const totalUnits = bloodStock.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0,
      );
      const criticalStock = bloodStock.filter(
        (item) => (item.quantity || 0) < 5,
      ).length;

      dashboardData = {
        ...dashboardData,
        stats: {
          totalUnits,
          criticalStock,
          pendingRequests,
          totalCamps: recentCamps.length,
        },
        bloodStock,
        recentCamps,
      };
    } else if (facility.facilityType === "hospital") {
      // Hospital dashboard
      const [inventory, pendingRequests, recentRequests] = await Promise.all([
        Blood.find({ hospital: facilityId }).sort({ bloodGroup: 1 }),
        BloodRequest.countDocuments({
          hospitalId: facilityId,
          status: "pending",
        }),
        BloodRequest.find({ hospitalId: facilityId })
          .populate("labId", "name")
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

      const totalUnits = inventory.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0,
      );
      const lowStock = inventory.filter(
        (item) => (item.quantity || 0) < 5,
      ).length;

      dashboardData = {
        ...dashboardData,
        stats: {
          totalUnits,
          lowStock,
          pendingRequests,
          totalRequests: recentRequests.length,
        },
        inventory,
        recentRequests,
      };
    }

    // Get recent activity from history
    const recentActivity =
      facility.history
        ?.sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10) || [];

    dashboardData.recentActivity = recentActivity;

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blood labs
// @route   GET /api/facility/labs
// @access  Private/Facility
export const getAllLabs = async (req, res, next) => {
  try {
    const { city, page = 1, limit = 20 } = req.query;

    const filter = {
      facilityType: "blood-lab",
      // Include pending labs so hospitals can see newly registered labs
      // (admin approval can still tighten this later).
      status: { $in: ["approved", "pending"] },
    };

    if (city) {
      filter["address.city"] = { $regex: city, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [labs, total] = await Promise.all([
      Facility.find(filter)
        .populate("user", "name email phone")
        .select("name email phone address operatingHours")
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Facility.countDocuments(filter),
    ]);

    // Get unique cities for filter
    const cities = await Facility.distinct("address.city", filter);

    res.json({
      success: true,
      data: {
        labs,
        cities,
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

// @desc    Get facility statistics
// @route   GET /api/facility/stats
// @access  Private/Facility
export const getFacilityStats = async (req, res, next) => {
  try {
    const facilityId = req.user._id || req.user.id;
    const facility = await Facility.findById(facilityId);

    if (!facility) {
      return next(new AppError("Facility not found", 404));
    }

    let stats = {};

    if (facility.facilityType === "blood-lab") {
      // Lab statistics
      const [
        totalDonations,
        totalRequests,
        fulfilledRequests,
        totalCamps,
        bloodTypeDistribution,
      ] = await Promise.all([
        Donor.aggregate([
          { $unwind: "$donationHistory" },
          { $match: { "donationHistory.facility": facilityId } },
          { $count: "total" },
        ]).then((r) => r[0]?.total || 0),
        BloodRequest.countDocuments({ labId: facilityId }),
        BloodRequest.countDocuments({ labId: facilityId, status: "accepted" }),
        BloodCamp.countDocuments({ hospital: facilityId }),
        Blood.aggregate([
          { $match: { bloodLab: facilityId } },
          {
            $group: {
              _id: "$bloodGroup",
              quantity: { $sum: "$quantity" },
            },
          },
        ]),
      ]);

      stats = {
        totalDonations,
        totalRequests,
        fulfilledRequests,
        pendingRequests: totalRequests - fulfilledRequests,
        fulfillmentRate:
          totalRequests > 0 ? (fulfilledRequests / totalRequests) * 100 : 0,
        totalCamps,
        bloodTypeDistribution,
      };
    } else if (facility.facilityType === "hospital") {
      // Hospital statistics
      const [
        totalRequests,
        fulfilledRequests,
        totalReceived,
        bloodTypeDistribution,
      ] = await Promise.all([
        BloodRequest.countDocuments({ hospitalId: facilityId }),
        BloodRequest.countDocuments({
          hospitalId: facilityId,
          status: "accepted",
        }),
        Blood.aggregate([
          { $match: { hospital: facilityId } },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]).then((r) => r[0]?.total || 0),
        Blood.aggregate([
          { $match: { hospital: facilityId } },
          {
            $group: {
              _id: "$bloodGroup",
              quantity: { $sum: "$quantity" },
            },
          },
        ]),
      ]);

      stats = {
        totalRequests,
        fulfilledRequests,
        pendingRequests: totalRequests - fulfilledRequests,
        fulfillmentRate:
          totalRequests > 0 ? (fulfilledRequests / totalRequests) * 100 : 0,
        totalReceived,
        bloodTypeDistribution,
      };
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get facility history
// @route   GET /api/facility/history
// @access  Private/Facility
export const getFacilityHistory = async (req, res, next) => {
  try {
    const facilityId = req.user._id || req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const facility = await Facility.findById(facilityId);

    if (!facility) {
      return next(new AppError("Facility not found", 404));
    }

    const history = facility.history || [];
    const sortedHistory = history.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedHistory = sortedHistory.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        history: paginatedHistory,
        total: history.length,
        page: parseInt(page),
        pages: Math.ceil(history.length / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};
