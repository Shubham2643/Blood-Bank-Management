import Blood from "../models/bloodModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import Facility from "../models/facilityModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
import Donor from "../models/donorModel.js";
import { AppError } from "../utils/errorHandler.js";
import { getIO, broadcastCampEvent, SocketEvents } from "../socket/index.js";
import { sendEmail } from "../utils/emailService.js";
import { notifyUser, notifyRole } from "../utils/notification.js";

export const getBloodLabDashboard = async (req, res, next) => {
  try {
    const labId = req.user._id;
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      camps,
      stock,
      facility,
      recentDonations,
      pendingRequests,
      weeklyStats,
      totalDonors,
    ] = await Promise.all([
      BloodCamp.find({ hospital: labId }).sort({ date: -1 }).limit(10),
      Blood.find({ bloodLab: labId }).sort({ bloodGroup: 1 }),
      Facility.findById(labId).select(
        "name email phone address operatingHours status history lastLogin",
      ),
      Donor.aggregate([
        { $unwind: "$donationHistory" },
        {
          $match: {
            "donationHistory.facility": labId,
            "donationHistory.donationDate": { $gt: weekAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$donationHistory.donationDate",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      BloodRequest.countDocuments({ labId, status: "pending" }),
      Blood.aggregate([
        { $match: { bloodLab: labId } },
        {
          $group: {
            _id: "$bloodGroup",
            quantity: { $sum: "$quantity" },
            critical: { $sum: { $cond: [{ $lt: ["$quantity", 5] }, 1, 0] } },
          },
        },
      ]),
      Donor.countDocuments(),
    ]);

    const totalUnits = stock.reduce((sum, item) => sum + item.quantity, 0);
    const criticalStock = stock.filter((item) => item.quantity < 5).length;

    res.json({
      success: true,
      data: {
        Facility: facility,
        stats: {
          totalCamps: camps.length,
          upcomingCamps: camps.filter((c) => String(c.status).toLowerCase() === "upcoming").length,
          totalUnits,
          criticalStock,
          pendingRequests,
          recentDonations: recentDonations.length,
          totalDonors,
        },
        stock: weeklyStats,
        recentCamps: camps,
        weeklyActivity: recentDonations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Backwards-compatible alias if other code imports getDashboard
export const getDashboard = getBloodLabDashboard;

export const createBloodCamp = async (req, res, next) => {
  const session = global.supportsTransactions ? await BloodCamp.startSession() : null;
  if (session) session.startTransaction();

  try {
    const labId = req.user._id;
    const campData = req.body;

    // Normalize status casing if client sent "Upcoming"/"Ongoing"/...
    if (campData?.status) {
      campData.status = String(campData.status).toLowerCase();
    }

    // Validate dates
    const campDate = new Date(campData.date);
    if (campDate < new Date()) {
      if (session) await session.abortTransaction();
      return next(new AppError("Camp date cannot be in the past", 400));
    }

    // Check for overlapping camps
    const existingCamp = await BloodCamp.findOne({
      hospital: labId,
      date: {
        $gte: new Date(campDate).setHours(0, 0, 0),
        $lt: new Date(campDate).setHours(23, 59, 59),
      },
    }).session(session);

    if (existingCamp) {
      if (session) await session.abortTransaction();
      return next(new AppError("A camp already exists on this date", 400));
    }

    const camp = await BloodCamp.create(
      [
        {
          hospital: labId,
          ...campData,
          location: {
            venue: campData.location?.venue || campData.venue,
            city: campData.location?.city || campData.city,
            state: campData.location?.state || campData.state,
            pincode: campData.location?.pincode || campData.pincode,
          },
        },
      ],
      { session },
    );

    // Update facility history
    await Facility.findByIdAndUpdate(labId, {
      $push: {
        history: {
          eventType: "Blood Camp",
          description: `Created camp: ${campData.title} at ${campData.venue}`,
          date: new Date(),
          referenceId: camp[0]._id,
        },
      },
    }).session(session);

    if (session) await session.commitTransaction();

    broadcastCampEvent(SocketEvents.NEW_CAMP, {
      campId: camp[0]._id,
      title: campData.title,
      location: campData.city,
      date: campData.date,
      status: camp[0].status,
      facilityId: labId.toString(),
      organizedBy: req.user.name,
    });

    await notifyRole(
      "donor",
      `New blood donation camp "${campData.title}" organized at ${campData.venue} on ${campData.date}`,
      "info"
    );

    res.status(201).json({
      success: true,
      message: "Blood camp created successfully",
      data: camp[0],
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const updateCampStatus = async (req, res, next) => {
  const session = global.supportsTransactions ? await BloodCamp.startSession() : null;
  if (session) session.startTransaction();

  try {
    const { id } = req.params;
    const { status, actualDonors } = req.body;
    const labId = req.user._id;

    const camp = await BloodCamp.findOne({
      _id: id,
      hospital: labId,
    }).session(session);

    if (!camp) {
      if (session) await session.abortTransaction();
      return next(new AppError("Camp not found", 404));
    }

    const oldStatus = camp.status;
    camp.status = status ? String(status).toLowerCase() : camp.status;

    if (actualDonors !== undefined) {
      camp.actualDonors = actualDonors;
    }

    await camp.save({ session });

    // Update facility history
    await Facility.findByIdAndUpdate(labId, {
      $push: {
        history: {
          eventType: "Blood Camp",
          description: `Camp status updated from ${oldStatus} to ${status}`,
          date: new Date(),
          referenceId: camp._id,
        },
      },
    }).session(session);

    if (session) await session.commitTransaction();

    const event =
      status && String(status).toLowerCase() === "completed"
        ? SocketEvents.CAMP_COMPLETED
        : SocketEvents.CAMP_UPDATED;

    broadcastCampEvent(event, {
      campId: camp._id,
      title: camp.title,
      status: camp.status,
      actualDonors: camp.actualDonors,
      facilityId: labId.toString(),
    });

    res.json({
      success: true,
      message: "Camp status updated successfully",
      data: camp,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const addBloodStock = async (req, res, next) => {
  const session = global.supportsTransactions ? await Blood.startSession() : null;
  if (session) session.startTransaction();

  try {
    const { bloodType, quantity, expiryDate } = req.body;
    const bloodLab = req.user._id;

    if (!bloodType || !quantity || quantity <= 0) {
      if (session) await session.abortTransaction();
      return next(
        new AppError("Please provide valid bloodType and quantity", 400),
      );
    }

    // Set expiry date (42 days from now if not provided)
    const expDate =
      expiryDate || new Date(Date.now() + 42 * 24 * 60 * 60 * 1000);

    let stock = await Blood.findOne({
      bloodGroup: bloodType,
      bloodLab,
      testingStatus: "safe",
      status: "available",
    }).session(session);

    if (stock) {
      stock.quantity += Number(quantity);
      stock.expiryDate = expDate;
      await stock.save({ session });
    } else {
      stock = await Blood.create(
        [
          {
            bloodGroup: bloodType,
            quantity: Number(quantity),
            expiryDate: expDate,
            bloodLab,
            testingStatus: "safe",
            status: "available",
          },
        ],
        { session },
      );
      stock = stock[0];
    }

    // Update facility history
    await Facility.findByIdAndUpdate(bloodLab, {
      $push: {
        history: {
          eventType: "Stock Update",
          description: `Added ${quantity} units of ${bloodType}`,
          date: new Date(),
        },
      },
    }).session(session);

    if (session) await session.commitTransaction();

    // Check for critical levels after addition
    if (stock.quantity < 10) {
      getIO()
        .to(`user:${req.user.user}`)
        .emit("stock-warning", {
          bloodType,
          quantity: stock.quantity,
          message: `Stock for ${bloodType} is low`,
        });

      await notifyUser(
        req.user.user,
        `Stock for ${bloodType} is low (< 10 units remaining: ${stock.quantity} units)`,
        "warning"
      );
    }

    res.json({
      success: true,
      message: "Blood stock added successfully",
      data: stock,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const removeBloodStock = async (req, res, next) => {
  const session = global.supportsTransactions ? await Blood.startSession() : null;
  if (session) session.startTransaction();

  try {
    const { bloodType, quantity } = req.body;
    const bloodLab = req.user._id;

    if (!bloodType || !quantity || quantity <= 0) {
      if (session) await session.abortTransaction();
      return next(
        new AppError("Please provide valid bloodType and quantity", 400),
      );
    }

    const stock = await Blood.findOne({
      bloodGroup: bloodType,
      bloodLab,
    }).session(session);

    if (!stock || stock.quantity < Number(quantity)) {
      if (session) await session.abortTransaction();
      return next(
        new AppError(
          `Insufficient stock. Available: ${stock?.quantity || 0} units`,
          400,
        ),
      );
    }

    stock.quantity -= Number(quantity);

    if (stock.quantity === 0) {
      await Blood.findByIdAndDelete(stock._id).session(session);
    } else {
      await stock.save({ session });
    }

    await Facility.findByIdAndUpdate(bloodLab, {
      $push: {
        history: {
          eventType: "Stock Update",
          description: `Removed ${quantity} units of ${bloodType}`,
          date: new Date(),
        },
      },
    }).session(session);

    if (session) await session.commitTransaction();

    res.json({
      success: true,
      message: "Blood stock removed successfully",
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const getBloodStock = async (req, res, next) => {
  try {
    const bloodLab = req.user._id;
    const stock = await Blood.find({ bloodLab }).sort({ bloodGroup: 1 });

    res.json({
      success: true,
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

export const getBloodLabCamps = async (req, res, next) => {
  try {
    const labId = req.user._id;
    const {
      status = "all",
      search = "",
      sortBy = "date",
      sortOrder = "desc",
      page = 1,
      limit = 8,
    } = req.query;

    const filter = { hospital: labId };

    if (status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { "location.venue": { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [camps, total] = await Promise.all([
      BloodCamp.find(filter)
        .sort(sort)
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
          hasNext: skip + camps.length < total,
          hasPrev: skip > 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBloodCamp = async (req, res, next) => {
  try {
    const labId = req.user._id;
    const { id } = req.params;
    const campData = req.body;

    const camp = await BloodCamp.findOneAndUpdate(
      { _id: id, hospital: labId },
      {
        ...campData,
        location: {
          venue: campData.location?.venue || campData.venue,
          city: campData.location?.city || campData.city,
          state: campData.location?.state || campData.state,
          pincode: campData.location?.pincode || campData.pincode,
        },
      },
      { new: true, runValidators: true },
    );

    if (!camp) {
      return next(new AppError("Camp not found", 404));
    }

    broadcastCampEvent(SocketEvents.CAMP_UPDATED, {
      campId: camp._id,
      title: camp.title,
      status: camp.status,
      location: camp.location?.city,
      date: camp.date,
      facilityId: labId.toString(),
    });

    res.json({
      success: true,
      message: "Blood camp updated successfully",
      data: camp,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBloodCamp = async (req, res, next) => {
  try {
    const labId = req.user._id;
    const { id } = req.params;

    const camp = await BloodCamp.findOneAndDelete({
      _id: id,
      hospital: labId,
    });

    if (!camp) {
      return next(new AppError("Camp not found", 404));
    }

    broadcastCampEvent(SocketEvents.CAMP_DELETED, {
      campId: camp._id,
      title: camp.title,
      facilityId: labId.toString(),
    });

    res.json({
      success: true,
      message: "Blood camp deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getLabBloodRequests = async (req, res, next) => {
  try {
    const labId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { labId };
    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .populate("hospitalId", "name email phone address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BloodRequest.countDocuments(filter),
    ]);

    // Get request statistics
    const stats = await BloodRequest.aggregate([
      { $match: { labId } },
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

export const updateBloodRequestStatus = async (req, res, next) => {
  const session = global.supportsTransactions ? await BloodRequest.startSession() : null;
  if (session) session.startTransaction();

  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const labId = req.user._id;

    const request = await BloodRequest.findOne({
      _id: id,
      labId,
    })
      .populate("hospitalId")
      .session(session);

    if (!request) {
      if (session) await session.abortTransaction();
      return next(new AppError("Request not found", 404));
    }

    if (request.status !== "pending") {
      if (session) await session.abortTransaction();
      return next(new AppError("Request already processed", 400));
    }

    if (action === "accept") {
      // Check stock
      const labStock = await Blood.findOne({
        bloodLab: labId,
        bloodGroup: request.bloodType,
      }).session(session);

      if (!labStock || labStock.quantity < request.units) {
        if (session) await session.abortTransaction();
        return next(
          new AppError(
            `Insufficient stock. Available: ${labStock?.quantity || 0} units`,
            400,
          ),
        );
      }

      // Update lab stock
      labStock.quantity -= request.units;
      if (labStock.quantity === 0) {
        await Blood.findByIdAndDelete(labStock._id).session(session);
      } else {
        await labStock.save({ session });
      }

      // Add to hospital stock
      const expiryDate = new Date(Date.now() + 42 * 24 * 60 * 60 * 1000);
      let hospitalStock = await Blood.findOne({
        hospital: request.hospitalId._id,
        bloodGroup: request.bloodType,
      }).session(session);

      if (hospitalStock) {
        hospitalStock.quantity += request.units;
        hospitalStock.expiryDate = expiryDate;
        await hospitalStock.save({ session });
      } else {
        await Blood.create(
          [
            {
              bloodGroup: request.bloodType,
              quantity: request.units,
              expiryDate,
              hospital: request.hospitalId._id,
            },
          ],
          { session },
        );
      }

      request.status = "accepted";
    } else {
      request.status = "rejected";
    }

    request.processedAt = new Date();
    request.processedBy = labId;
    await request.save({ session });

    // Update history for both parties
    await Facility.findByIdAndUpdate(labId, {
      $push: {
        history: {
          eventType: "Stock Update",
          description: `${action === "accept" ? "Fulfilled" : "Rejected"} blood request for ${request.units} units of ${request.bloodType}`,
          date: new Date(),
          referenceId: request._id,
        },
      },
    }).session(session);

    await Facility.findByIdAndUpdate(request.hospitalId._id, {
      $push: {
        history: {
          eventType: "Stock Update",
          description: `Your request for ${request.units} units of ${request.bloodType} was ${request.status}`,
          date: new Date(),
          referenceId: request._id,
        },
      },
    }).session(session);

    if (session) await session.commitTransaction();

    // Send real-time notification
    getIO()
      .to(`user:${request.hospitalId.user}`)
      .emit("request-processed", {
        requestId: request._id,
        status: request.status,
        bloodType: request.bloodType,
        units: request.units,
        message: `Your blood request has been ${request.status}`,
      });

    await notifyUser(
      request.hospitalId.user,
      `Your blood request for ${request.units} units of ${request.bloodType} has been ${request.status}`,
      request.status === "accepted" ? "success" : "warning"
    );

    // Sync testing queue for the lab
    getIO().to(`user:${req.user.user}`).emit("testing-queue-updated", {
      message: "Blood request processed, stock updated."
    });

    // Send email notification
    await sendEmail({
      email: request.hospitalId.email,
      subject: `Blood Request ${action === "accept" ? "Accepted" : "Rejected"} - LifeDrop`,
      template: "requestProcessed",
      data: {
        hospitalName: request.hospitalId.name,
        bloodType: request.bloodType,
        units: request.units,
        status: request.status,
        labName: req.user.name,
      },
    });

    res.json({
      success: true,
      message: `Request ${action}ed successfully`,
      data: request,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const getBloodLabHistory = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.user._id).select("history");

    if (!facility) {
      return next(new AppError("Facility not found", 404));
    }

    const history = facility.history || [];

    res.json({
      success: true,
      activity: history,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLabs = async (req, res, next) => {
  try {
    const { city } = req.query;

    const filter = {
      facilityType: "blood-lab",
      // Allow hospitals to see labs that are still pending.
      status: { $in: ["approved", "pending"] },
    };

    if (city) {
      filter["address.city"] = { $regex: city, $options: "i" };
    }

    const labs = await Facility.find(filter)
      .select("name email phone address operatingHours")
      .sort({ name: 1 });

    res.json({
      success: true,
      data: labs,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingBags = async (req, res, next) => {
  try {
    const bloodLab = req.user._id;
    const pendingBags = await Blood.find({
      bloodLab,
      testingStatus: "pending-test",
    }).populate({
      path: "donor",
      populate: { path: "user", select: "name" },
    });

    res.json({
      success: true,
      data: pendingBags,
    });
  } catch (error) {
    next(error);
  }
};

export const submitTestResults = async (req, res, next) => {
  const session = global.supportsTransactions ? await Blood.startSession() : null;
  if (session) session.startTransaction();

  try {
    const { bagId, hiv, hbv, hcv, malaria, syphilis, hemoglobin, bloodPressure, pulse, temperature } = req.body;
    const bloodLab = req.user._id;

    const bag = await Blood.findOne({ bagId, bloodLab }).session(session);
    if (!bag) {
      if (session) await session.abortTransaction();
      return next(new AppError("Blood bag not found", 404));
    }

    bag.diseasesTested = { hiv, hbv, hcv, malaria, syphilis };
    
    // Save health metrics if provided
    bag.healthMetrics = {
      hemoglobin: hemoglobin ? Number(hemoglobin) : undefined,
      bloodPressure: bloodPressure || undefined,
      pulse: pulse ? Number(pulse) : undefined,
      temperature: temperature ? Number(temperature) : undefined,
    };

    const isUnsafe = hiv || hbv || hcv || malaria || syphilis;
    if (isUnsafe) {
      bag.testingStatus = "unsafe-discarded";
      bag.status = "expired";
    } else {
      bag.testingStatus = "safe";
      bag.status = "available";
    }

    await bag.save({ session });
    if (session) await session.commitTransaction();

    // Emit socket event to update lab UI
    getIO().to(`user:${req.user.user}`).emit("testing-queue-updated", {
      message: "Test results submitted, queue updated."
    });

    res.json({
      success: true,
      message: isUnsafe
        ? "Blood bag marked unsafe and discarded"
        : "Blood bag certified safe and added to inventory",
      data: bag,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const splitWholeBlood = async (req, res, next) => {
  const session = global.supportsTransactions ? await Blood.startSession() : null;
  if (session) session.startTransaction();

  try {
    const { bagId } = req.body;
    const bloodLab = req.user._id;

    const originalBag = await Blood.findOne({
      bagId,
      bloodLab,
      componentType: "Whole Blood",
      testingStatus: "safe",
    }).session(session);

    if (!originalBag) {
      if (session) await session.abortTransaction();
      return next(new AppError("Safe Whole Blood bag not found", 404));
    }

    // Delete original Whole Blood bag
    await Blood.findByIdAndDelete(originalBag._id).session(session);

    // Create components: Packed Red Blood Cells (PRBC), Platelets, Fresh Frozen Plasma (FFP)
    const components = [
      {
        bloodGroup: originalBag.bloodGroup,
        componentType: "Packed Red Blood Cells",
        quantity: 1,
        expiryDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
        bloodLab,
        testingStatus: "safe",
        status: "available",
        donor: originalBag.donor,
        diseasesTested: originalBag.diseasesTested,
      },
      {
        bloodGroup: originalBag.bloodGroup,
        componentType: "Platelets",
        quantity: 1,
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        bloodLab,
        testingStatus: "safe",
        status: "available",
        donor: originalBag.donor,
        diseasesTested: originalBag.diseasesTested,
      },
      {
        bloodGroup: originalBag.bloodGroup,
        componentType: "Fresh Frozen Plasma",
        quantity: 1,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        bloodLab,
        testingStatus: "safe",
        status: "available",
        donor: originalBag.donor,
        diseasesTested: originalBag.diseasesTested,
      },
    ];

    const created = await Blood.create(components, { session });

    if (session) await session.commitTransaction();

    // Emit socket event to update lab UI
    getIO().to(`user:${req.user.user}`).emit("testing-queue-updated", {
      message: "Whole Blood bag split into components."
    });

    res.json({
      success: true,
      message: "Successfully separated Whole Blood into PRBC, Platelets, and FFP",
      data: created,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const getCampRegistrations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const labId = req.user._id;

    const camp = await BloodCamp.findOne({ _id: id, hospital: labId })
      .populate({
        path: "registeredDonors.donor",
        populate: { path: "user", select: "name phone" },
      });

    if (!camp) {
      return next(new AppError("Camp not found or unauthorized", 404));
    }

    res.json({
      success: true,
      data: camp.registeredDonors,
    });
  } catch (error) {
    next(error);
  }
};

export const recordDonationVitals = async (req, res, next) => {
  const session = global.supportsTransactions ? await Facility.startSession() : null;
  if (session) session.startTransaction();

  try {
    const { id: campId } = req.params;
    const { donorId, weight, bloodPressure, hemoglobin, pulse, quantity = 1 } = req.body;
    const labId = req.user._id;

    // Check camp
    const camp = await BloodCamp.findOne({ _id: campId, hospital: labId }).session(session);
    if (!camp) {
      if (session) await session.abortTransaction();
      return next(new AppError("Camp not found", 404));
    }

    // Check donor
    const donor = await Donor.findById(donorId).session(session);
    if (!donor) {
      if (session) await session.abortTransaction();
      return next(new AppError("Donor not found", 404));
    }

    // Verify eligibility checks: Hemoglobin >= 12.5, Weight >= 45
    if (weight && weight < 45) {
      if (session) await session.abortTransaction();
      return next(new AppError("Donor weight is below 45kg (ineligible)", 400));
    }
    if (hemoglobin && hemoglobin < 12.5) {
      if (session) await session.abortTransaction();
      return next(new AppError("Donor hemoglobin is below 12.5 g/dL (ineligible)", 400));
    }

    // Update donor history
    donor.donationHistory.push({
      donationDate: new Date(),
      facility: labId,
      bloodGroup: donor.bloodGroup,
      quantity,
      verified: true,
    });
    donor.lastDonationDate = new Date();
    await donor.save({ session });

    const newDonation = donor.donationHistory[donor.donationHistory.length - 1];

    // Create Blood bag in pending-test
    const bloodBag = await Blood.create(
      [
        {
          bloodGroup: donor.bloodGroup,
          componentType: "Whole Blood",
          quantity,
          expiryDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
          bloodLab: labId,
          testingStatus: "pending-test",
          status: "reserved",
          donor: donor._id,
          donationId: newDonation._id,
          healthMetrics: {
            hemoglobin: hemoglobin ? Number(hemoglobin) : undefined,
            bloodPressure: bloodPressure || undefined,
            pulse: pulse ? Number(pulse) : undefined,
            temperature: 98.4,
          },
        },
      ],
      { session },
    );

    // Increment camp actualDonors count
    camp.actualDonors += 1;
    await camp.save({ session });

    if (session) await session.commitTransaction();

    // Emit socket event to update lab UI
    getIO().to(`user:${req.user.user}`).emit("testing-queue-updated", {
      message: "Donation vitals recorded, blood bag added to screening queue."
    });

    res.json({
      success: true,
      message: "Donation vitals recorded and blood bag created for screening",
      data: {
        bloodBag: bloodBag[0],
        donor,
      },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};
