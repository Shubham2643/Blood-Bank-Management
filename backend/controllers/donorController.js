// controllers/donorController.js
import Donor from "../models/donorModel.js";
import User from "../models/UserModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import { AppError } from "../utils/errorHandler.js";
import { broadcastCampEvent, SocketEvents } from "../socket/index.js";
import { seedCampsIfEmpty } from "./publicController.js";

const normalizeGender = (gender) => {
  if (!gender) return gender;
  const g = String(gender).trim().toLowerCase();
  if (g === "male") return "Male";
  if (g === "female") return "Female";
  if (g === "other") return "Other";
  return gender;
};

// @desc    Get donor profile
// @route   GET /api/donor/profile
// @access  Private/Donor
export const getDonorProfile = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.user.id)
      .populate("user", "name email phone role")
      .populate({
        path: "donationHistory.faculty",
        select: "address",
      })
      .select("-password -refreshToken -emailVerificationToken");

    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    // Calculate eligibility (90-day rule)
    const isEligible = donor.isEligible;

    // Get next eligible date
    let nextEligibleDate = null;
    if (donor.lastDonationDate) {
      const next = new Date(donor.lastDonationDate);
      next.setDate(next.getDate() + 90);
      nextEligibleDate = next;
    }

    // Get donation statistics
    const donationStats = {
      totalDonations: donor.donationHistory.length,
      totalUnits: donor.donationHistory.reduce(
        (sum, d) => sum + (d.quantity || 1),
        0,
      ),
      lastDonation: donor.lastDonationDate,
      nextEligibleDate,
      isEligible,
    };

    const baseUser = donor.user && typeof donor.user === "object" ? donor.user : null;
    const mergedDonor = {
      id: donor._id,
      donorId: donor._id,
      fullName: baseUser?.name,
      name: baseUser?.name,
      email: baseUser?.email ?? donor.email,
      phone: baseUser?.phone,
      bloodGroup: donor.bloodGroup,
      age: donor.age,
      gender: donor.gender,
      weight: donor.weight,
      address: donor.address,
      lastDonationDate: donor.lastDonationDate,
      nextEligibleDate,
      isEligible: donor.isEligible,
      eligibleToDonate: donor.isEligible,
      createdAt: donor.createdAt,
      updatedAt: donor.updatedAt,
    };

    res.json({
      success: true,
      donor: mergedDonor,
      donationStats,
      recentDonations: donor.donationHistory.slice(-5).reverse(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donor profile
// @route   PUT /api/donor/profile
// @access  Private/Donor
export const updateDonorProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      "fullName",
      "phone",
      "address",
      "age",
      "gender",
      "weight",
      "bloodGroup",
    ];

    // Filter updates
    const filteredUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Check if updating to ineligible
    if (updates.weight && updates.weight < 45) {
      filteredUpdates.isEligible = false;
    }

    // Update base User fields (name/phone) if provided
    const userUpdates = {};
    if (typeof updates.fullName === "string" && updates.fullName.trim()) {
      userUpdates.name = updates.fullName.trim();
    }
    if (typeof updates.phone === "string" && updates.phone.trim()) {
      userUpdates.phone = updates.phone.trim();
    }
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user.user, userUpdates, {
        new: true,
        runValidators: true,
      });
    }

    if (typeof filteredUpdates.gender === "string") {
      filteredUpdates.gender = normalizeGender(filteredUpdates.gender);
    }

    const donor = await Donor.findByIdAndUpdate(req.user.id, filteredUpdates, {
      new: true,
      runValidators: true,
    }).populate("user", "name email phone role");

    res.json({
      success: true,
      message: "Profile updated successfully",
      donor: {
        id: donor._id,
        donorId: donor._id,
        fullName: donor.user?.name,
        name: donor.user?.name,
        email: donor.user?.email ?? donor.email,
        phone: donor.user?.phone,
        bloodGroup: donor.bloodGroup,
        age: donor.age,
        gender: donor.gender,
        weight: donor.weight,
        address: donor.address,
        lastDonationDate: donor.lastDonationDate,
        isEligible: donor.isEligible,
        eligibleToDonate: donor.isEligible,
        createdAt: donor.createdAt,
        updatedAt: donor.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor statistics
// @route   GET /api/donor/stats
// @access  Private/Donor
export const getDonorStats = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.user.id);

    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    // Calculate various stats
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const stats = {
      totalDonations: donor.donationHistory.length,
      totalUnits: donor.donationHistory.reduce(
        (sum, d) => sum + (d.quantity || 1),
        0,
      ),
      lastDonation: donor.lastDonationDate,
      isEligible: donor.isEligible,
      daysSinceLastDonation: donor.lastDonationDate
        ? Math.floor((now - donor.lastDonationDate) / (1000 * 60 * 60 * 24))
        : null,
      donationsThisYear: donor.donationHistory.filter(
        (d) => new Date(d.donationDate).getFullYear() === now.getFullYear(),
      ).length,
      uniqueFacilities: new Set(
        donor.donationHistory.map((d) => d.faculty?.toString()),
      ).size,
    };

    // Get monthly donation trend
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthStr = month.toLocaleString("default", { month: "short" });

      const count = donor.donationHistory.filter((d) => {
        const donationDate = new Date(d.donationDate);
        return (
          donationDate.getMonth() === month.getMonth() &&
          donationDate.getFullYear() === month.getFullYear()
        );
      }).length;

      last6Months.push({ month: monthStr, count });
    }

    res.json({
      success: true,
      stats,
      monthlyTrend: last6Months,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available blood camps for donors
// @route   GET /api/donor/camps
// @access  Private/Donor
export const getDonorCamps = async (req, res, next) => {
  try {
    await seedCampsIfEmpty();
    const { status, city, search, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (city && city !== "all") {
      filter["location.city"] = city;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { "location.venue": { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
      ];
    }

    // Only show upcoming and ongoing camps to donors
    // Normalize both casing variants (some UI sends "Upcoming", DB stores "upcoming")
    filter.status = { $in: ["upcoming", "ongoing", "Upcoming", "Ongoing"] };
    filter.date = { $gte: new Date() };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [camps, total] = await Promise.all([
      BloodCamp.find(filter)
        .populate("hospital", "name email phone")
        .sort({ date: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BloodCamp.countDocuments(filter),
    ]);

    // Check if donor is registered for each camp
    const donor = await Donor.findById(req.user.id);
    const campsWithRegistration = camps.map((camp) => {
      const campObj = camp.toObject();
      campObj.isRegistered =
        donor?.donationHistory?.some(
          (h) => h.campId?.toString() === camp._id.toString(),
        ) || false;
      return campObj;
    });

    // Get unique cities for filter
    const cities = await BloodCamp.distinct("location.city", {
      status: { $in: ["upcoming", "ongoing", "Upcoming", "Ongoing"] },
    });

    res.json({
      success: true,
      data: {
        camps: campsWithRegistration,
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

// @desc    Register for a blood camp
// @route   POST /api/donor/camps/:id/register
// @access  Private/Donor
export const registerForCamp = async (req, res, next) => {
  const session = await Donor.startSession();
  session.startTransaction();

  try {
    const campId = req.params.id;
    const donorId = req.user.id;

    // Find camp
    const camp = await BloodCamp.findById(campId).session(session);
    if (!camp) {
      await session.abortTransaction();
      return next(new AppError("Camp not found", 404));
    }

    // Check if camp is upcoming (normalize casing)
    if (String(camp.status).toLowerCase() !== "upcoming") {
      await session.abortTransaction();
      return next(new AppError("Camp is not available for registration", 400));
    }

    // Check if donor is eligible
    const donor = await Donor.findById(donorId).session(session);
    if (!donor.isEligible) {
      await session.abortTransaction();
      return next(
        new AppError("You are not eligible to donate blood at this time", 400),
      );
    }

    // Check if already registered
    const alreadyRegistered = camp.registeredDonors?.some(
      (id) => id.toString() === donorId,
    );

    if (alreadyRegistered) {
      await session.abortTransaction();
      return next(new AppError("Already registered for this camp", 400));
    }

    // Register donor
    if (!camp.registeredDonors) {
      camp.registeredDonors = [];
    }
    camp.registeredDonors.push(donorId);
    await camp.save({ session });

    await session.commitTransaction();

    // Notify camp organizers and refresh camp lists for donors
    broadcastCampEvent(SocketEvents.CAMP_UPDATED, {
      campId: camp._id,
      title: camp.title,
      registeredCount: camp.registeredDonors?.length ?? 0,
      facilityId: camp.hospital?.toString(),
    });

    broadcastCampEvent(SocketEvents.CAMP_REGISTRATION, {
      campId: camp._id,
      donorName: donor.fullName,
      donorBloodGroup: donor.bloodGroup,
      facilityId: camp.hospital?.toString(),
    });

    res.json({
      success: true,
      message: "Successfully registered for camp",
      data: camp,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Get donor donation history
// @route   GET /api/donor/history
// @access  Private/Donor
export const getDonorHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donor = await Donor.findById(req.user.id).populate({
      path: "donationHistory.faculty",
      select: "name address.city",
    });

    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    // Sort history by date (most recent first)
    const history = [...donor.donationHistory].sort(
      (a, b) => new Date(b.donationDate) - new Date(a.donationDate),
    );

    const total = history.length;
    const paginatedHistory = history.slice(skip, skip + parseInt(limit));

    // Get statistics
    const stats = {
      totalDonations: total,
      totalUnits: history.reduce((sum, d) => sum + (d.quantity || 1), 0),
      firstDonation:
        history.length > 0 ? history[history.length - 1].donationDate : null,
      lastDonation: history.length > 0 ? history[0].donationDate : null,
      uniqueFacilities: new Set(history.map((d) => d.faculty?._id?.toString()))
        .size,
    };

    res.json({
      success: true,
      history: paginatedHistory,
      stats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donation certificate
// @route   GET /api/donor/certificate/:donationId
// @access  Private/Donor
export const getDonationCertificate = async (req, res, next) => {
  try {
    const { donationId } = req.params;

    const donor = await Donor.findOne({
      _id: req.user.id,
      "donationHistory._id": donationId,
    }).populate("donationHistory.faculty", "name registrationNumber");

    if (!donor) {
      return next(new AppError("Donation record not found", 404));
    }

    const donation = donor.donationHistory.id(donationId);

    // Generate certificate data
    const certificate = {
      id: donation._id,
      donorName: donor.fullName,
      donorBloodGroup: donor.bloodGroup,
      donationDate: donation.donationDate,
      facilityName: donation.faculty?.name || "Blood Connect",
      facilityRegNo: donation.faculty?.registrationNumber || "N/A",
      quantity: donation.quantity || 1,
      certificateNumber: `BC-${donation._id.toString().slice(-8).toUpperCase()}`,
      issuedAt: new Date(),
    };

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search for donors (for hospitals/labs)
// @route   GET /api/donor/search
// @access  Private/Hospital or Lab
export const searchDonor = async (req, res, next) => {
  try {
    const term = req.query.term || req.query.query || "";
    const { bloodGroup, city } = req.query;

    const filter = {};

    if (term) {
      filter.$or = [
        { fullName: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
        { phone: { $regex: term, $options: "i" } },
      ];
    }

    if (bloodGroup && bloodGroup !== "all") {
      filter.bloodGroup = bloodGroup;
    }

    if (city && city !== "all") {
      filter["address.city"] = { $regex: city, $options: "i" };
    }

    const donors = await Donor.find(filter)
      .select("fullName email phone bloodGroup lastDonationDate address.city")
      .limit(20);

    res.json({
      success: true,
      donors,
      data: donors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark donation (for labs/hospitals)
// @route   POST /api/donor/donate/:id
// @access  Private/Hospital or Lab
export const markDonation = async (req, res, next) => {
  const session = await Donor.startSession();
  session.startTransaction();

  try {
    const donorId = req.params.id;
    const { quantity = 1, remarks } = req.body;
    const facultyId = req.user._id;

    const donor = await Donor.findById(donorId).session(session);
    if (!donor) {
      await session.abortTransaction();
      return next(new AppError("Donor not found", 404));
    }

    // Check eligibility
    if (!donor.isEligible) {
      await session.abortTransaction();
      return next(new AppError("Donor is not eligible to donate", 400));
    }

    // Add to donation history
    donor.donationHistory.push({
      donationDate: new Date(),
      faculty: facultyId,
      bloodGroup: donor.bloodGroup,
      quantity,
      remarks,
      verified: true,
    });

    // Update last donation date
    donor.lastDonationDate = new Date();

    await donor.save({ session });
    await session.commitTransaction();

    // Emit real-time update
    getIO().to(`user:${donorId}`).emit("donation-made", {
      message: "Your donation has been recorded",
      donationDate: new Date(),
    });

    res.json({
      success: true,
      message: "Donation recorded successfully",
      data: donor,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Get recent donations (for labs/hospitals)
// @route   GET /api/donor/recent-donations
// @access  Private/Hospital or Lab
export const getRecentDonations = async (req, res, next) => {
  try {
    const facultyId = req.user._id;
    const { limit = 10 } = req.query;

    const donors = await Donor.find({
      "donationHistory.faculty": facultyId,
    })
      .select("fullName bloodGroup donationHistory")
      .populate("donationHistory.faculty", "name")
      .sort({ "donationHistory.donationDate": -1 })
      .limit(parseInt(limit));

    const recentDonations = [];
    donors.forEach((donor) => {
      donor.donationHistory.forEach((donation) => {
        if (donation.faculty?._id.toString() === facultyId.toString()) {
          recentDonations.push({
            donorName: donor.fullName,
            bloodGroup: donor.bloodGroup,
            date: donation.donationDate,
            quantity: donation.quantity,
            facility: donation.faculty?.name,
          });
        }
      });
    });

    recentDonations.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    const limitedDonations = recentDonations.slice(0, parseInt(limit));

    const stats = {
      total: limitedDonations.length,
      today: limitedDonations.filter((d) => {
        const dDate = new Date(d.date);
        const now = new Date();
        return (
          dDate.getDate() === now.getDate() &&
          dDate.getMonth() === now.getMonth() &&
          dDate.getFullYear() === now.getFullYear()
        );
      }).length,
      thisWeek: limitedDonations.filter((d) => {
        const dDate = new Date(d.date);
        const now = new Date();
        const diff =
          (now.getTime() - dDate.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      }).length,
    };

    res.json({
      success: true,
      donations: limitedDonations,
      stats,
      data: limitedDonations,
    });
  } catch (error) {
    next(error);
  }
};
