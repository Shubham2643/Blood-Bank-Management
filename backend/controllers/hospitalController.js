import Blood from "../models/bloodModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
import Facility from "../models/facilityModel.js";
import Donor from "../models/donorModel.js";
import User from "../models/UserModel.js";
import { AppError } from "../utils/errorHandler.js";
import { getIO } from "../socket/index.js";
import { notifyUser } from "../utils/notification.js";
import { sendGeofencedSMSAlerts } from "../utils/geofence.js";

export const getDashboard = async (req, res, next) => {
  try {
    const hospitalId = req.user._id;

    // Fetch all data in parallel for performance
    const [
      inventory,
      allRequests,
      hospital,
      lowStock,
      expiringSoon,
      recentDonors,
      requestStats,
    ] = await Promise.all([
      Blood.find({ hospital: hospitalId }).sort({ bloodGroup: 1 }),
      BloodRequest.find({ hospitalId })
        .populate("labId", "name email phone address operatingHours")
        .sort({ createdAt: -1 })
        .limit(20),
      Facility.findById(hospitalId).select(
        "name email phone address operatingHours facilityType facilityCategory status history lastLogin",
      ),
      Blood.countDocuments({
        hospital: hospitalId,
        quantity: { $lt: 5 },
      }),
      Blood.countDocuments({
        hospital: hospitalId,
        expiryDate: {
          $lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          $gt: new Date(),
        },
      }),
      Donor.find({
        "donationHistory.facility": hospitalId,
      })
        .populate("user", "name")
        .select("email bloodGroup lastDonationDate user")
        .sort({ "donationHistory.donationDate": -1 })
        .limit(5),
      // Aggregate request stats by status
      BloodRequest.aggregate([
        { $match: { hospitalId: hospitalId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalUnits: { $sum: "$units" },
          },
        },
      ]),
    ]);

    const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const pendingRequests = allRequests.filter(
      (r) => r.status === "pending",
    ).length;
    const acceptedRequests = allRequests.filter(
      (r) => r.status === "accepted",
    ).length;
    const rejectedRequests = allRequests.filter(
      (r) => r.status === "rejected",
    ).length;

    // Fulfillment rate: accepted / (accepted + rejected) * 100
    const totalProcessed = acceptedRequests + rejectedRequests;
    const fulfillmentRate = totalProcessed > 0
      ? Math.round((acceptedRequests / totalProcessed) * 100)
      : 0;

    // Calculate inventory by blood type
    const inventoryByType = inventory.reduce((acc, item) => {
      acc[item.bloodGroup] = {
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        _id: item._id,
        status:
          item.quantity < 5
            ? "critical"
            : item.quantity < 10
              ? "low"
              : "normal",
      };
      return acc;
    }, {});

    // Blood type distribution for charts
    const bloodTypeDistribution = inventory.map((item) => ({
      bloodGroup: item.bloodGroup,
      quantity: item.quantity,
      status:
        item.quantity < 5
          ? "critical"
          : item.quantity < 10
            ? "low"
            : "normal",
    }));

    // Parse request stats from aggregation
    const requestStatsMap = {};
    requestStats.forEach((s) => {
      requestStatsMap[s._id] = { count: s.count, totalUnits: s.totalUnits };
    });

    res.json({
      success: true,
      data: {
        hospital: {
          name: hospital?.name,
          email: hospital?.email,
          phone: hospital?.phone,
          address: hospital?.address,
          operatingHours: hospital?.operatingHours,
          facilityType: hospital?.facilityType,
          facilityCategory: hospital?.facilityCategory,
          status: hospital?.status,
          history: hospital?.history || [],
          lastLogin: hospital?.lastLogin,
        },
        stats: {
          totalUnits,
          pendingRequests,
          acceptedRequests,
          rejectedRequests,
          lowStock,
          expiringSoon,
          totalRequests: allRequests.length,
          fulfillmentRate,
          bloodTypesInStock: inventory.length,
          requestStats: requestStatsMap,
        },
        inventory: inventoryByType,
        inventoryList: inventory,
        bloodTypeDistribution,
        recentRequests: allRequests,
        recentDonors,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const requestBlood = async (req, res, next) => {
  const session = global.supportsTransactions ? await BloodRequest.startSession() : null;
  if (session) session.startTransaction();

  try {
    const hospitalId = req.user._id;
    const { labId, bloodType, units, urgency = "normal", notes } = req.body;

    // Validate
    if (!labId || !bloodType || !units) {
      return next(
        new AppError("Please provide labId, bloodType, and units", 400),
      );
    }

    if (units < 1 || units > 100) {
      return next(new AppError("Units must be between 1 and 100", 400));
    }

    // Check lab exists and is a blood-lab (both approved and pending shown in dropdown)
    const lab = await Facility.findOne({
      _id: labId,
      facilityType: "blood-lab",
      status: { $in: ["approved", "pending"] },
    }).session(session);

    if (!lab) {
      return next(new AppError("Blood lab not found", 404));
    }

    // Check for duplicate pending request
    const existingRequest = await BloodRequest.findOne({
      hospitalId,
      labId,
      bloodType,
      status: "pending",
    }).session(session);

    if (existingRequest) {
      return next(
        new AppError(
          "You already have a pending request for this blood type from this lab",
          400,
        ),
      );
    }

    // Create request
    const request = await BloodRequest.create(
      [
        {
          hospitalId,
          labId,
          bloodType,
          units,
          urgency,
          notes,
          requestedAt: new Date(),
        },
      ],
      { session },
    );

    // Add to hospital history
    await Facility.findByIdAndUpdate(hospitalId, {
      $push: {
        history: {
          eventType: "Stock Update",
          description: `Requested ${units} units of ${bloodType} from ${lab.name} (${urgency})`,
          date: new Date(),
          referenceId: request[0]._id,
        },
      },
    }).session(session);

    if (session) await session.commitTransaction();

    let notifiedDonors = [];
    if (urgency === "urgent" || urgency === "emergency") {
      const hospital = await Facility.findById(hospitalId);
      if (hospital) {
        notifiedDonors = await sendGeofencedSMSAlerts(request[0], hospital);
        // Save geofenced alerts on the request document
        request[0].geofencedAlerts = {
          donorCount: notifiedDonors.length,
          notifiedDonors: notifiedDonors
        };
        await request[0].save();
      }
    }

    // Notify lab
    getIO().to(`user:${lab.user}`).emit("new-request", {
      requestId: request[0]._id,
      hospitalName: req.user.name,
      bloodType,
      units,
      urgency,
      timestamp: new Date(),
    });

    await notifyUser(
      lab.user,
      `New blood request from ${req.user.name} for ${bloodType} (${units} units)`,
      "info"
    );

    res.status(201).json({
      success: true,
      message: "Blood request sent successfully",
      data: request[0],
      geofencedAlerts: {
        donorCount: notifiedDonors.length,
        notifiedDonors
      }
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const hospitalId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { hospitalId };
    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .populate("labId", "name email phone address operatingHours")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BloodRequest.countDocuments(filter),
    ]);

    // Get statistics
    const stats = await BloodRequest.aggregate([
      { $match: { hospitalId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalUnits: { $sum: "$units" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        requests,
        stats,
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

export const getInventory = async (req, res, next) => {
  try {
    const hospitalId = req.user._id;

    const inventory = await Blood.find({ hospital: hospitalId }).sort({
      bloodGroup: 1,
    });

    // Get expiry summary
    const expirySummary = inventory.map((item) => ({
      bloodGroup: item.bloodGroup,
      quantity: item.quantity,
      expiryDate: item.expiryDate,
      daysUntilExpiry: Math.ceil(
        (item.expiryDate - new Date()) / (1000 * 60 * 60 * 24),
      ),
      status:
        item.expiryDate < new Date()
          ? "expired"
          : item.expiryDate < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            ? "critical"
            : item.expiryDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              ? "warning"
              : "good",
    }));

    // Calculate totals
    const totals = {
      totalUnits: inventory.reduce((sum, item) => sum + item.quantity, 0),
      expiringSoon: expirySummary.filter(
        (i) => i.status === "critical" || i.status === "warning",
      ).length,
      expired: expirySummary.filter((i) => i.status === "expired").length,
      byBloodType: expirySummary.reduce((acc, item) => {
        acc[item.bloodGroup] = {
          quantity: item.quantity,
          status: item.status,
          daysUntilExpiry: item.daysUntilExpiry,
        };
        return acc;
      }, {}),
    };

    res.json({
      success: true,
      data: {
        inventory: expirySummary,
        totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDonors = async (req, res, next) => {
  try {
    const { search, bloodGroup, city, availability, sortBy, page = 1, limit = 20 } = req.query;

    const filter = { $and: [] };

    // Search by Name/Phone/Email/Location
    if (search) {
      // Find matching users first since User is a referenced model
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
        ]
      }).select("_id");
      
      const userIds = matchingUsers.map(u => u._id);

      filter.$and.push({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { user: { $in: userIds } },
          { "address.city": { $regex: search, $options: "i" } },
          { "address.street": { $regex: search, $options: "i" } }
        ]
      });
    }

    if (bloodGroup && bloodGroup !== "all") {
      filter.$and.push({ bloodGroup });
    }

    if (city && city !== "all") {
      filter.$and.push({ "address.city": { $regex: city, $options: "i" } });
    }

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const threeMonthsAndWeekAgo = new Date();
    threeMonthsAndWeekAgo.setMonth(threeMonthsAndWeekAgo.getMonth() - 3);
    threeMonthsAndWeekAgo.setDate(threeMonthsAndWeekAgo.getDate() + 7);

    // Availability Filter (available now vs available soon vs recently donated)
    if (availability === "available") {
      filter.$and.push({
        $or: [
          { lastDonationDate: { $lt: threeMonthsAgo } },
          { lastDonationDate: { $exists: false } },
          { lastDonationDate: null }
        ]
      });
    } else if (availability === "soon") {
      filter.$and.push({
        lastDonationDate: {
          $gte: threeMonthsAgo,
          $lt: threeMonthsAndWeekAgo
        }
      });
    } else if (availability === "unavailable") {
      filter.$and.push({
        lastDonationDate: {
          $gte: threeMonthsAndWeekAgo
        }
      });
    } else {
      // By default for standard directory search, if not specified, we can show all eligible or all donors.
      // Let's fallback to returning all registered donors to let hospital search freely.
    }

    if (filter.$and.length === 0) {
      delete filter.$and;
    }

    // Dynamic Sorting
    let sortQuery = { lastDonationDate: -1 };
    if (sortBy === "name") {
      sortQuery = { email: 1 }; // Fallback sort since name is in referenced document
    } else if (sortBy === "bloodGroup") {
      sortQuery = { bloodGroup: 1 };
    } else if (sortBy === "city") {
      sortQuery = { "address.city": 1 };
    } else if (sortBy === "lastDonation") {
      sortQuery = { lastDonationDate: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [donors, total] = await Promise.all([
      Donor.find(filter)
        .populate("user", "name phone")
        .select(
          "email bloodGroup age gender weight address lastDonationDate donationHistory user",
        )
        .sort(sortQuery)
        .skip(skip)
        .limit(parseInt(limit)),
      Donor.countDocuments(filter),
    ]);

    // Enhance with donation count and user name fallbacks
    const enhancedDonors = donors.map((donor) => {
      const obj = donor.toObject();
      return {
        ...obj,
        fullName: obj.user?.name || obj.email,
        phone: obj.user?.phone || "",
        totalDonations: obj.donationHistory?.length || 0,
      };
    });

    // Calculate donor counts for stats
    const allDonorsCount = await Donor.countDocuments(bloodGroup && bloodGroup !== "all" ? { bloodGroup } : {});
    const allAvailableDonorsCount = await Donor.countDocuments({
      $and: [
        bloodGroup && bloodGroup !== "all" ? { bloodGroup } : {},
        {
          $or: [
            { lastDonationDate: { $lt: threeMonthsAgo } },
            { lastDonationDate: { $exists: false } },
            { lastDonationDate: null }
          ]
        }
      ].filter(f => Object.keys(f).length > 0)
    });

    const rareGroups = ["O-", "AB-", "B-", "A-"];
    const rareBloodCount = await Donor.countDocuments({
      $and: [
        { bloodGroup: { $in: rareGroups } },
        {
          $or: [
            { lastDonationDate: { $lt: threeMonthsAgo } },
            { lastDonationDate: { $exists: false } },
            { lastDonationDate: null }
          ]
        }
      ]
    });

    const stats = {
      total: allDonorsCount,
      available: allAvailableDonorsCount,
      rareBlood: rareBloodCount,
    };

    res.json({
      success: true,
      donors: enhancedDonors,
      stats,
      data: {
        donors: enhancedDonors,
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

export const contactDonor = async (req, res, next) => {
  try {
    const hospitalId = req.user._id;
    const { id } = req.params;

    const donor = await Donor.findById(id)
      .populate("user", "name phone")
      .select("bloodGroup email user");

    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    await Facility.findByIdAndUpdate(hospitalId, {
      $push: {
        history: {
          eventType: "Donor Contact",
          description: `Contacted donor ${donor.user?.name || donor.email} (${donor.bloodGroup})`,
          date: new Date(),
          referenceId: donor._id,
        },
      },
    });

    res.json({
      success: true,
      message: "Contact attempt logged",
    });
  } catch (error) {
    next(error);
  }
};

export const createDonor = async (req, res, next) => {
  const session = global.supportsTransactions ? await User.startSession() : null;
  if (session) session.startTransaction();

  try {
    const {
      name,
      email,
      phone,
      bloodGroup,
      age,
      gender,
      weight,
      address,
      lastDonationDate,
    } = req.body;

    if (!name || !email || !phone || !bloodGroup || !age || !gender || !address || !address.street || !address.city || !address.state || !address.pincode) {
      return next(new AppError("Please fill out all required fields", 400));
    }

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      return next(new AppError("User with this email already exists", 400));
    }

    const newUser = await User.create([
      {
        name,
        email,
        phone,
        role: "donor",
        authProvider: "local",
        password: "password123",
      }
    ], { session });

    const newDonor = await Donor.create([
      {
        user: newUser[0]._id,
        email,
        bloodGroup,
        age,
        gender,
        weight: weight ? Number(weight) : undefined,
        address,
        lastDonationDate: lastDonationDate || null,
      }
    ], { session });

    const hospitalId = req.user._id;
    await Facility.findByIdAndUpdate(hospitalId, {
      $push: {
        history: {
          eventType: "Profile Update",
          description: `Registered new donor: ${name} (${bloodGroup})`,
          date: new Date(),
          referenceId: newDonor[0]._id,
        },
      },
    }).session(session);

    if (session) await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Donor registered successfully",
      data: {
        donor: {
          ...newDonor[0].toObject(),
          fullName: name,
          phone,
          totalDonations: 0,
        },
      },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const updateDonor = async (req, res, next) => {
  const session = global.supportsTransactions ? await User.startSession() : null;
  if (session) session.startTransaction();

  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      bloodGroup,
      age,
      gender,
      weight,
      address,
      lastDonationDate,
    } = req.body;

    const donor = await Donor.findById(id).session(session);
    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    if (email && email.toLowerCase() !== donor.email.toLowerCase()) {
      const existingUser = await User.findOne({ email }).session(session);
      if (existingUser) {
        return next(new AppError("User with this email already exists", 400));
      }
      donor.email = email;
    }

    const user = await User.findById(donor.user).select("+password").session(session);
    if (user) {
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (email) user.email = email;
      await user.save({ session });
    }

    if (bloodGroup) donor.bloodGroup = bloodGroup;
    if (age) donor.age = age;
    if (gender) donor.gender = gender;
    if (weight !== undefined) donor.weight = weight ? Number(weight) : undefined;
    if (address) {
      if (address.street) donor.address.street = address.street;
      if (address.city) donor.address.city = address.city;
      if (address.state) donor.address.state = address.state;
      if (address.pincode) donor.address.pincode = address.pincode;
    }
    if (lastDonationDate !== undefined) {
      donor.lastDonationDate = lastDonationDate ? new Date(lastDonationDate) : null;
    }

    await donor.save({ session });

    const hospitalId = req.user._id;
    await Facility.findByIdAndUpdate(hospitalId, {
      $push: {
        history: {
          eventType: "Profile Update",
          description: `Updated donor profile: ${user?.name || donor.email}`,
          date: new Date(),
          referenceId: donor._id,
        },
      },
    }).session(session);

    if (session) await session.commitTransaction();

    res.json({
      success: true,
      message: "Donor profile updated successfully",
      data: {
        donor: {
          ...donor.toObject(),
          fullName: user?.name || donor.email,
          phone: user?.phone || "",
        },
      },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const deleteDonor = async (req, res, next) => {
  const session = global.supportsTransactions ? await User.startSession() : null;
  if (session) session.startTransaction();

  try {
    const { id } = req.params;

    const donor = await Donor.findById(id).session(session);
    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    await User.findByIdAndDelete(donor.user).session(session);
    await Donor.findByIdAndDelete(id).session(session);

    const hospitalId = req.user._id;
    await Facility.findByIdAndUpdate(hospitalId, {
      $push: {
        history: {
          eventType: "Profile Update",
          description: `Deleted donor record for: ${donor.email}`,
          date: new Date(),
          referenceId: donor._id,
        },
      },
    }).session(session);

    if (session) await session.commitTransaction();

    res.json({
      success: true,
      message: "Donor deleted successfully",
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

