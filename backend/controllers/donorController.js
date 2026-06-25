// controllers/donorController.js
import Donor from "../models/donorModel.js";
import User from "../models/UserModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import { AppError } from "../utils/errorHandler.js";
import { broadcastCampEvent, SocketEvents } from "../socket/index.js";
import { seedCampsIfEmpty } from "./publicController.js";
import { notifyUser } from "../utils/notification.js";
import facility from "../models/facilityModel.js";
import Blood from "../models/bloodModel.js";

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
        path: "donationHistory.facility",
        select: "name address",
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

    // Update base User fields (name/phone/password) if provided
    const userUpdates = {};
    if (typeof updates.fullName === "string" && updates.fullName.trim()) {
      userUpdates.name = updates.fullName.trim();
    }
    if (typeof updates.phone === "string" && updates.phone.trim()) {
      userUpdates.phone = updates.phone.trim();
    }
    if (typeof updates.password === "string" && updates.password.trim().length >= 6) {
      userUpdates.password = updates.password;
    }
    if (Object.keys(userUpdates).length > 0) {
      const user = await User.findById(req.user.user).select("+password");
      if (user) {
        if (userUpdates.name) user.name = userUpdates.name;
        if (userUpdates.phone) user.phone = userUpdates.phone;
        if (userUpdates.password) user.password = userUpdates.password;
        await user.save();
      }
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
        donor.donationHistory.map((d) => d.facility?.toString()),
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

    // Auto-migrate malformed registeredDonors (legacy format)
    try {
      const malformedCamps = await BloodCamp.find({
        "registeredDonors.donor": { $exists: false },
        "registeredDonors.0": { $exists: true }
      });
      for (const mc of malformedCamps) {
        let updated = false;
        for (const reg of mc.registeredDonors) {
          if (!reg.donor && reg._id) {
            reg.donor = reg._id;
            updated = true;
          }
        }
        if (updated) {
          await mc.save();
        }
      }
    } catch (migErr) {
      console.error("Migration error:", migErr);
    }

    const [camps, total] = await Promise.all([
      BloodCamp.find(filter)
        .populate("hospital", "name email phone")
        .sort({ date: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BloodCamp.countDocuments(filter),
    ]);

    // Check if donor is registered for each camp
    const campsWithRegistration = camps.map((camp) => {
      const campObj = camp.toObject();
      campObj.isRegistered = camp.registeredDonors?.some(
        (reg) =>
          (reg.donor && reg.donor.toString() === req.user.id.toString()) ||
          (reg._id && reg._id.toString() === req.user.id.toString())
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
  const session = global.supportsTransactions ? await Donor.startSession() : null;
  if (session) session.startTransaction();

  try {
    const campId = req.params.id;
    const donorId = req.user.id;

    // Find camp
    const camp = await BloodCamp.findById(campId).session(session);
    if (!camp) {
      if (session) await session.abortTransaction();
      return next(new AppError("Camp not found", 404));
    }

    // Check if camp is upcoming (normalize casing)
    if (String(camp.status).toLowerCase() !== "upcoming") {
      if (session) await session.abortTransaction();
      return next(new AppError("Camp is not available for registration", 400));
    }

    // Check if donor is eligible
    const donor = await Donor.findById(donorId).session(session);
    if (!donor.isEligible) {
      if (session) await session.abortTransaction();
      return next(
        new AppError("You are not eligible to donate blood at this time", 400),
      );
    }

    // Check if already registered
    const alreadyRegistered = camp.registeredDonors?.some(
      (reg) =>
        (reg.donor && reg.donor.toString() === donorId.toString()) ||
        (reg._id && reg._id.toString() === donorId.toString()),
    );

    if (alreadyRegistered) {
      if (session) await session.abortTransaction();
      return next(new AppError("Already registered for this camp", 400));
    }

    // Register donor
    if (!camp.registeredDonors) {
      camp.registeredDonors = [];
    }
    camp.registeredDonors.push({ donor: donorId });
    await camp.save({ session });

    if (session) await session.commitTransaction();

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

    if (camp.hospital) {
      const facilityObj = await facility.findById(camp.hospital);
      if (facilityObj) {
        await notifyUser(
          facilityObj.user,
          `Donor ${req.user.name} (${donor.bloodGroup}) registered for your camp "${camp.title}"`,
          "success"
        );
      }
    }

    res.json({
      success: true,
      message: "Successfully registered for camp",
      data: camp,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
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
      path: "donationHistory.facility",
      select: "name address",
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
      uniqueFacilities: new Set(history.map((d) => d.facility?._id?.toString()))
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

// @desc    Simulate a blood donation at a registered camp
// @route   POST /api/donor/camps/:id/simulate-donation
// @access  Private/Donor
export const simulateCampDonation = async (req, res, next) => {
  const session = global.supportsTransactions ? await Donor.startSession() : null;
  if (session) session.startTransaction();

  try {
    const campId = req.params.id;
    const donorId = req.user.id;

    // Find camp
    const camp = await BloodCamp.findById(campId).session(session);
    if (!camp) {
      if (session) await session.abortTransaction();
      return next(new AppError("Camp not found", 404));
    }

    // Verify donor is registered for this camp
    const isRegistered = camp.registeredDonors?.some(
      (reg) =>
        (reg.donor && reg.donor.toString() === donorId.toString()) ||
        (reg._id && reg._id.toString() === donorId.toString())
    );

    if (!isRegistered) {
      if (session) await session.abortTransaction();
      return next(new AppError("You must be registered for this camp to donate", 400));
    }

    // Find donor
    const donor = await Donor.findById(donorId).session(session);
    if (!donor) {
      if (session) await session.abortTransaction();
      return next(new AppError("Donor profile not found", 404));
    }

    // Check if donor already has a donation at this camp on the same day to prevent duplicates
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const alreadyDonatedToday = donor.donationHistory?.some(
      (d) =>
        d.facility?.toString() === camp.hospital?.toString() &&
        new Date(d.donationDate) >= todayStart &&
        new Date(d.donationDate) <= todayEnd
    );

    if (alreadyDonatedToday) {
      if (session) await session.abortTransaction();
      return next(new AppError("You have already recorded a donation at this facility today", 400));
    }

    const donationDate = new Date();
    
    // Add donation history entry
    donor.donationHistory.push({
      donationDate: donationDate,
      facility: camp.hospital, // the hospital hosting the camp
      bloodGroup: donor.bloodGroup,
      quantity: 1,
      verified: true,
    });
    
    donor.lastDonationDate = donationDate;
    await donor.save({ session });

    // Get the newly added donation subdocument to retrieve its _id
    const newDonation = donor.donationHistory[donor.donationHistory.length - 1];

    // Create corresponding Blood bag in pending-test
    await Blood.create(
      [
        {
          bloodGroup: donor.bloodGroup,
          componentType: "Whole Blood",
          quantity: 1,
          expiryDate: new Date(donationDate.getTime() + 42 * 24 * 60 * 60 * 1000),
          bloodLab: camp.hospital,
          testingStatus: "pending-test",
          status: "reserved",
          donor: donor._id,
          donationId: newDonation._id,
          healthMetrics: {
            hemoglobin: 14.5,
            bloodPressure: "120/80",
            pulse: 75,
            temperature: 98.6,
          }
        },
      ],
      { session }
    );

    // Increment camp actualDonors count
    camp.actualDonors = (camp.actualDonors || 0) + 1;
    await camp.save({ session });

    if (session) await session.commitTransaction();

    // Emit real-time update to blood lab testing queue
    if (camp.hospital) {
      try {
        const facilityDoc = await facility.findById(camp.hospital);
        if (facilityDoc) {
          getIO().to(`user:${facilityDoc.user}`).emit("testing-queue-updated", {
            message: `New donation bag registered from camp "${camp.title}"`,
            bagDetails: {
              bloodGroup: donor.bloodGroup,
              componentType: "Whole Blood",
              donorName: donor.fullName
            }
          });
        }
      } catch (socketErr) {
        console.error("Failed to emit socket update for simulated donation:", socketErr.message);
      }
    }

    res.json({
      success: true,
      message: "Donation simulated successfully! Your certificate of appreciation has been generated.",
      data: {
        donationId: newDonation._id,
        certificateNumber: `BC-${newDonation._id.toString().slice(-8).toUpperCase()}`,
      }
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
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
    })
      .populate("user", "name")
      .populate("donationHistory.facility", "name registrationNumber");

    if (!donor) {
      return next(new AppError("Donation record not found", 404));
    }

    const donation = donor.donationHistory.id(donationId);

    // Generate certificate data
    const certificate = {
      id: donation._id,
      donorName: donor.user?.name || "LifeDrop Donor",
      donorBloodGroup: donor.bloodGroup,
      donationDate: donation.donationDate,
      facilityName: donation.facility?.name || "Blood Connect",
      facilityRegNo: donation.facility?.registrationNumber || "N/A",
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
  const session = global.supportsTransactions ? await Donor.startSession() : null;
  if (session) session.startTransaction();

  try {
    const donorId = req.params.id;
    const { quantity = 1, remarks } = req.body;
    const facilityId = req.user._id;

    const donor = await Donor.findById(donorId).session(session);
    if (!donor) {
      if (session) await session.abortTransaction();
      return next(new AppError("Donor not found", 404));
    }

    // Check eligibility
    if (!donor.isEligible) {
      if (session) await session.abortTransaction();
      return next(new AppError("Donor is not eligible to donate", 400));
    }

    // Add to donation history
    donor.donationHistory.push({
      donationDate: new Date(),
      facility: facilityId,
      bloodGroup: donor.bloodGroup,
      quantity,
      remarks,
      verified: true,
    });

    // Update last donation date
    donor.lastDonationDate = new Date();

    await donor.save({ session });
    if (session) await session.commitTransaction();

    // Emit real-time update
    getIO().to(`user:${donor.user}`).emit("donation-made", {
      message: "Your donation has been recorded",
      donationDate: new Date(),
    });

    res.json({
      success: true,
      message: "Donation recorded successfully",
      data: donor,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

// @desc    Get recent donations (for labs/hospitals)
// @route   GET /api/donor/recent-donations
// @access  Private/Hospital or Lab
export const getRecentDonations = async (req, res, next) => {
  try {
    const facilityId = req.user._id;
    const { limit = 10 } = req.query;

    const donors = await Donor.find({
      "donationHistory.facility": facilityId,
    })
      .select("fullName bloodGroup donationHistory")
      .populate("donationHistory.facility", "name")
      .sort({ "donationHistory.donationDate": -1 })
      .limit(parseInt(limit));

    const recentDonations = [];
    donors.forEach((donor) => {
      donor.donationHistory.forEach((donation) => {
        if (donation.facility?._id.toString() === facilityId.toString()) {
          recentDonations.push({
            donorName: donor.fullName,
            bloodGroup: donor.bloodGroup,
            date: donation.donationDate,
            quantity: donation.quantity,
            facility: donation.facility?.name,
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

// @desc    Get tracking journey for a blood donation
// @route   GET /api/donor/donation/:donationId/journey
// @access  Private/Donor
export const getDonationJourney = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const donor = await Donor.findById(req.user.id);

    if (!donor) {
      return next(new AppError("Donor profile not found", 404));
    }

    const donation = donor.donationHistory.id(donationId);
    if (!donation) {
      return next(new AppError("Donation record not found", 404));
    }

    // Try to find the associated facility
    const facilityObj = await facility.findById(donation.facility).select("name address");
    const facilityName = facilityObj?.name || "Blood Donation Center";
    const facilityCity = facilityObj?.address?.city || donation.city || "Local City";

    const donationDate = new Date(donation.donationDate);
    const dateStr = donationDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const timeStr = donationDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    // Look for matching blood bags in Blood collection
    const dateStart = new Date(donationDate.getTime() - 24 * 60 * 60 * 1000);
    const dateEnd = new Date(donationDate.getTime() + 24 * 60 * 60 * 1000);

    const bags = await Blood.find({
      donor: req.user.id,
      createdAt: { $gte: dateStart, $lte: dateEnd }
    }).populate("hospital", "name address");

    let stages = [];

    if (bags.length > 0) {
      // Real database tracking
      // Use the first bag to represent testing and status
      const primaryBag = bags[0];
      
      // Stage 1: Donated
      stages.push({
        id: "donated",
        title: "Donation Completed",
        description: `Successfully donated 1 unit of ${donation.bloodGroup} blood at ${facilityName}.`,
        status: "completed",
        date: dateStr,
        time: timeStr,
        location: facilityCity
      });

      // Stage 2: Screened & Certified
      let stage2Status = "pending";
      let stage2Desc = "Blood unit undergoing mandatory screening for HIV, HBV, HCV, Malaria, and Syphilis.";
      if (primaryBag.testingStatus === "safe") {
        stage2Status = "completed";
        stage2Desc = "Mandatory screening completed. Certified safe for medical transfusion.";
      } else if (primaryBag.testingStatus === "unsafe-discarded") {
        stage2Status = "failed";
        stage2Desc = "Screening completed. The unit did not meet safety parameters and was safely discarded.";
      }
      stages.push({
        id: "screened",
        title: "Screened & Certified",
        description: stage2Desc,
        status: stage2Status,
        location: facilityName
      });

      // Stage 3: Component Separation
      // Check if it was split or component type is specialized
      const hasComponents = bags.length > 1 || primaryBag.componentType !== "Whole Blood";
      let stage3Status = "pending";
      let stage3Desc = "Prepared as Whole Blood for inventory storage.";
      if (primaryBag.testingStatus === "safe") {
        if (hasComponents) {
          stage3Status = "completed";
          const compNames = bags.map(b => b.componentType).join(", ");
          stage3Desc = `Separated into critical components: ${compNames} for custom therapy.`;
        } else {
          stage3Status = "completed";
          stage3Desc = "Whole Blood unit stored in temperature-controlled inventory.";
        }
      } else if (primaryBag.testingStatus === "unsafe-discarded") {
        stage3Status = "cancelled";
        stage3Desc = "Discontinued due to safety test results.";
      }
      stages.push({
        id: "component",
        title: "Component Separation",
        description: stage3Desc,
        status: stage3Status,
        location: facilityName
      });

      // Stage 4: Dispatched to Hospital
      let stage4Status = "pending";
      let stage4Desc = "Awaiting request from local clinics or emergency hospital stock.";
      let stage4Loc = facilityName;
      if (primaryBag.testingStatus === "safe") {
        const hospitalBag = bags.find(b => b.hospital);
        if (hospitalBag) {
          stage4Status = "completed";
          stage4Desc = `Dispatched to ${hospitalBag.hospital?.name || "Emergency Hospital"} due to urgent blood request.`;
          stage4Loc = hospitalBag.hospital?.address?.city || hospitalBag.hospital?.name;
        } else if (primaryBag.status === "used" || primaryBag.status === "reserved") {
          stage4Status = "completed";
          stage4Desc = "Dispatched and reserved at destination medical storage facility.";
        }
      } else if (primaryBag.testingStatus === "unsafe-discarded") {
        stage4Status = "cancelled";
        stage4Desc = "Dispatched cancelled. Blood bag discarded.";
      }
      stages.push({
        id: "dispatched",
        title: "Dispatched to Clinic",
        description: stage4Desc,
        status: stage4Status,
        location: stage4Loc
      });

      // Stage 5: Transfused / Saved Lives
      let stage5Status = "pending";
      let stage5Desc = "Awaiting transfusion to save a patient in emergency.";
      if (primaryBag.testingStatus === "safe") {
        if (primaryBag.status === "used") {
          stage5Status = "completed";
          stage5Desc = "Transfused to patient! 3 Lives saved and impacted.";
        } else if (primaryBag.status === "reserved") {
          stage5Status = "in-progress";
          stage5Desc = "Reserved for an upcoming surgical procedure.";
        }
      } else if (primaryBag.testingStatus === "unsafe-discarded") {
        stage5Status = "cancelled";
        stage5Desc = "Transfusion aborted.";
      }
      stages.push({
        id: "transfused",
        title: "Transfused & Saved Lives",
        description: stage5Desc,
        status: stage5Status,
        location: "Destination Clinic"
      });

    } else {
      // Fallback deterministic simulation based on elapsed days
      const diffDays = Math.floor((new Date() - donationDate) / (1000 * 60 * 60 * 24));

      // Stage 1: Donated (Always Completed)
      stages.push({
        id: "donated",
        title: "Donation Completed",
        description: `Successfully donated 1 unit of ${donation.bloodGroup} blood at ${facilityName}.`,
        status: "completed",
        date: dateStr,
        time: timeStr,
        location: facilityCity
      });

      // Stage 2: Screened
      const day2Str = new Date(donationDate.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      stages.push({
        id: "screened",
        title: "Screened & Certified",
        description: diffDays >= 1 
          ? "Mandatory screening completed. Certified safe for medical transfusion." 
          : "Blood unit undergoing mandatory screening for HIV, HBV, HCV, Malaria, and Syphilis.",
        status: diffDays >= 1 ? "completed" : "in-progress",
        date: diffDays >= 1 ? day2Str : null,
        location: facilityName
      });

      // Stage 3: Components
      const day3Str = new Date(donationDate.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      stages.push({
        id: "component",
        title: "Component Separation",
        description: diffDays >= 2 
          ? "Separated into critical components: Packed Red Blood Cells, Platelets, and Plasma." 
          : diffDays >= 1 ? "Component extraction in progress." : "Awaiting screening completion.",
        status: diffDays >= 2 ? "completed" : diffDays >= 1 ? "in-progress" : "pending",
        date: diffDays >= 2 ? day3Str : null,
        location: facilityName
      });

      // Stage 4: Dispatched
      const day4Str = new Date(donationDate.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      stages.push({
        id: "dispatched",
        title: "Dispatched to Clinic",
        description: diffDays >= 4 
          ? `Dispatched to emergency hospital stock at ${facilityCity} General Hospital.` 
          : diffDays >= 2 ? "Reserved in central repository, preparing dispatch." : "Awaiting components processing.",
        status: diffDays >= 4 ? "completed" : diffDays >= 2 ? "in-progress" : "pending",
        date: diffDays >= 4 ? day4Str : null,
        location: facilityCity
      });

      // Stage 5: Transfused
      const day7Str = new Date(donationDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      stages.push({
        id: "transfused",
        title: "Transfused & Saved Lives",
        description: diffDays >= 7 
          ? "Transfused to patient! 3 Lives saved and impacted." 
          : diffDays >= 4 ? "Reserved for a scheduled surgery at the hospital." : "Awaiting clinical delivery.",
        status: diffDays >= 7 ? "completed" : diffDays >= 4 ? "in-progress" : "pending",
        date: diffDays >= 7 ? day7Str : null,
        location: "General Hospital"
      });
    }

    res.json({
      success: true,
      donationId,
      stages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor donation health report card data
// @route   GET /api/donor/health-report/:donationId
// @access  Private/Donor
export const getDonationHealthReport = async (req, res, next) => {
  try {
    const { donationId } = req.params;

    const donor = await Donor.findById(req.user.id)
      .populate("user", "name")
      .populate("donationHistory.facility", "name registrationNumber");

    if (!donor) {
      return next(new AppError("Donor not found", 404));
    }

    const donation = donor.donationHistory.id(donationId);
    if (!donation) {
      return next(new AppError("Donation record not found", 404));
    }

    const donationDate = new Date(donation.donationDate);
    const dateStart = new Date(donationDate.getTime() - 24 * 60 * 60 * 1000);
    const dateEnd = new Date(donationDate.getTime() + 24 * 60 * 60 * 1000);

    // Look for matching blood bag by exact reference, or fall back to date approximation
    let bags = await Blood.find({ donationId: donation._id });
    if (bags.length === 0) {
      bags = await Blood.find({
        donor: req.user.id,
        createdAt: { $gte: dateStart, $lte: dateEnd }
      });
    }

    let metrics = {};
    let screening = {};
    let isSafe = true;

    if (bags.length > 0) {
      const bag = bags[0];
      metrics = bag.healthMetrics || {};
      screening = bag.diseasesTested || {};
      isSafe = bag.testingStatus === "safe";
    }

    res.json({
      success: true,
      data: {
        donor: {
          name: donor.user?.name || "LifeDrop Donor",
          bloodGroup: donor.bloodGroup,
          age: donor.age,
          gender: donor.gender,
          weight: donor.weight || 65,
        },
        donation: {
          id: donation._id,
          date: donation.donationDate,
          facilityName: donation.facility?.name || "Civil Hospital",
          facilityRegNo: donation.facility?.registrationNumber || "REG-99201",
        },
        healthMetrics: {
          hemoglobin: metrics.hemoglobin || 14.2,
          bloodPressure: metrics.bloodPressure || "120/80",
          pulse: metrics.pulse || 72,
          temperature: metrics.temperature || 98.4,
        },
        screeningResults: {
          hiv: screening.hiv || false,
          hbv: screening.hbv || false,
          hcv: screening.hcv || false,
          malaria: screening.malaria || false,
          syphilis: screening.syphilis || false,
          isSafe: isSafe
        },
        reportNumber: `HR-${donation._id.toString().slice(-8).toUpperCase()}`,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

