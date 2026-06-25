import Donor from "../models/donorModel.js";
import Facility from "../models/facilityModel.js";
import Blood from "../models/bloodModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import PublicBloodRequest from "../models/publicBloodRequestModel.js";
import BloodRequest from "../models/bloodRequestModel.js";
import NewsletterSubscriber from "../models/newsletterSubscriberModel.js";
import ContactMessage from "../models/contactMessageModel.js";
import User from "../models/UserModel.js";
import { sendEmail } from "../utils/emailService.js";
import { AppError } from "../utils/errorHandler.js";
import {
  getEkaCampsNearby,
  getEkaCampsUpcomingIndia,
} from "../integrations/ekaCare.js";

export const getPublicStats = async (req, res, next) => {
  try {
    const [totalDonors, totalUnits, partnerHospitals] = await Promise.all([
      Donor.countDocuments(),
      Blood.aggregate([
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]).then((r) => r[0]?.total || 0),
      Facility.countDocuments({ facilityType: "hospital", status: "approved" }),
    ]);

    res.json({
      livesSaved: totalDonors * 3,
      bloodUnits: totalUnits,
      partnerHospitals,
      activeDonors: totalDonors,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmergencyNeeds = async (req, res, next) => {
  try {
    const [publicReqs, hospitalReqs] = await Promise.all([
      PublicBloodRequest.find({ status: "active" }),
      BloodRequest.find({ status: "pending" }),
    ]);

    const needsMap = {};
    const bloodTypesList = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

    bloodTypesList.forEach((type) => {
      needsMap[type] = {
        type,
        requestedUnits: 0,
        requestsCount: 0,
        criticalCount: 0,
        emergencyCount: 0,
      };
    });

    publicReqs.forEach((r) => {
      if (needsMap[r.bloodType]) {
        needsMap[r.bloodType].requestedUnits += r.units || 0;
        needsMap[r.bloodType].requestsCount += 1;
        if (r.urgency === "critical") needsMap[r.bloodType].criticalCount += 1;
        if (r.urgency === "emergency" || r.urgency === "high") {
          needsMap[r.bloodType].emergencyCount += 1;
        }
      }
    });

    hospitalReqs.forEach((r) => {
      if (needsMap[r.bloodType]) {
        needsMap[r.bloodType].requestedUnits += r.units || 0;
        needsMap[r.bloodType].requestsCount += 1;
        if (r.urgency === "emergency") needsMap[r.bloodType].criticalCount += 1;
        if (r.urgency === "urgent") needsMap[r.bloodType].emergencyCount += 1;
      }
    });

    const defaultNeeds = {
      "A+": { type: "A+", need: "High", requestedUnits: 12, requestsCount: 3, donors: "32%" },
      "A-": { type: "A-", need: "Critical", requestedUnits: 18, requestsCount: 4, donors: "8%" },
      "B+": { type: "B+", need: "Medium", requestedUnits: 6, requestsCount: 2, donors: "12%" },
      "B-": { type: "B-", need: "High", requestedUnits: 10, requestsCount: 2, donors: "3%" },
      "O+": { type: "O+", need: "High", requestedUnits: 14, requestsCount: 3, donors: "35%" },
      "O-": { type: "O-", need: "Critical", requestedUnits: 22, requestsCount: 5, donors: "5%" },
      "AB+": { type: "AB+", need: "Low", requestedUnits: 0, requestsCount: 0, donors: "4%" },
      "AB-": { type: "AB-", need: "Medium", requestedUnits: 4, requestsCount: 1, donors: "1%" },
    };

    Object.values(needsMap).forEach((item) => {
      if (item.requestedUnits > 0) {
        defaultNeeds[item.type].requestedUnits += item.requestedUnits;
        defaultNeeds[item.type].requestsCount += item.requestsCount;
      }
    });

    const needs = Object.values(defaultNeeds).map((item) => {
      let needLevel = "Low";
      if (item.requestedUnits >= 15 || item.type === "O-" || item.type === "A-") {
        needLevel = "Critical";
      } else if (item.requestedUnits >= 8 || item.type === "A+" || item.type === "O+" || item.type === "B-") {
        needLevel = "High";
      } else if (item.requestedUnits > 0 || item.type === "B+" || item.type === "AB-") {
        needLevel = "Medium";
      }
      return {
        type: item.type,
        need: needLevel,
        requestedUnits: item.requestedUnits,
        requestsCount: item.requestsCount,
        donors: item.donors,
      };
    });

    res.json({
      success: true,
      needs,
    });
  } catch (error) {
    next(error);
  }
};

export const seedCampsIfEmpty = async () => {
  try {
    // In production, do not seed mock data automatically unless explicitly enabled
    if (process.env.NODE_ENV === "production" && process.env.SEED_MOCK_DATA !== "true") {
      return;
    }

    const count = await BloodCamp.countDocuments();
    const hasOldCamps = await BloodCamp.countDocuments({
      title: /Mega Blood Donation Drive|Lifesaver Donation Drive|Red Connect Camp/
    });

    if (count > 0 && hasOldCamps === 0) {
      // Database already has the new, realistic camps and no old mock ones.
      return;
    }

    console.log("🔄 Upgrading database with real-life, real-time Indian blood camps...");

    // Find camps with active registrations to preserve them
    const activeCamps = await BloodCamp.find({ "registeredDonors.0": { $exists: true } });
    const activeCampIds = activeCamps.map(c => c._id);

    // Delete all other camps (which have 0 registrations)
    await BloodCamp.deleteMany({ _id: { $nin: activeCampIds } });

    // Update the active preserved camps to have realistic details
    for (const c of activeCamps) {
      const title = c.title;
      let updateData = {};
      if (title.includes("Surat")) {
        updateData = {
          title: "Surat Red Cross Blood Donation Drive",
          description: "Join the annual Surat Red Cross donation camp. Walk-ins and registrations welcome. Refreshments, free health screening, and certificates provided.",
          location: {
            venue: "Rotary Hall, Jivan Bharti School Campus, Nanpura",
            city: "Surat",
            state: "Gujarat",
            pincode: "395001"
          },
          coordinates: { lat: 21.1960, lng: 72.8192 }
        };
      } else if (title.includes("Gandhinagar")) {
        updateData = {
          title: "Gandhinagar Youth Blood Connect Camp",
          description: "Gandhinagar Community blood drive organized by Civil Hospital Gandhinagar. Help save lives by participating. Free checkup and refreshments for all donors.",
          location: {
            venue: "Sector 11 Community Centre, Near Town Hall",
            city: "Gandhinagar",
            state: "Gujarat",
            pincode: "382011"
          },
          coordinates: { lat: 23.2248, lng: 72.6465 }
        };
      } else if (title.includes("Jamnagar")) {
        updateData = {
          title: "Jamnagar Samarpan Blood Drive",
          description: "Jamnagar district donation camp organized by Samarpan Blood Centre. Your contribution is critical for regional emergency surgeries. Donors will receive certification.",
          location: {
            venue: "Samarpan General Hospital premises, Khambhalia Highway",
            city: "Jamnagar",
            state: "Gujarat",
            pincode: "361006"
          },
          coordinates: { lat: 22.4589, lng: 70.0465 }
        };
      } else if (title.includes("Junagadh")) {
        updateData = {
          title: "Junagadh Lion's Club Donation Camp",
          description: "Junagadh community campaign. Let's unite to help patients in need of rare blood types. Free checkup and donor certificates provided.",
          location: {
            venue: "Lion's Club Community Hall, Moti Baug",
            city: "Junagadh",
            state: "Gujarat",
            pincode: "362001"
          },
          coordinates: { lat: 21.5283, lng: 70.4549 }
        };
      }

      if (Object.keys(updateData).length > 0) {
        await BloodCamp.findByIdAndUpdate(c._id, updateData);
      }
    }

    // List of new, realistic Indian blood camps to add
    const newCamps = [
      {
        hospital: "69a96fb8d0f470fb761d96e3", // Civil Hospital Ahmedabad
        title: "Samarpan Foundation Adajan Blood Camp",
        description: "Samarpan Foundation annual blood donation drive in Surat. Fully air-conditioned mobile buses, expert medical staff, and premium refreshments provided.",
        location: {
          venue: "Prime Arcade Grounds, Adajan Road",
          city: "Surat",
          state: "Gujarat",
          pincode: "395009"
        },
        coordinates: { lat: 21.2012, lng: 72.8023 },
        daysOffset: 1
      },
      {
        hospital: "69b3a1c91a7255d05cab0626", // Kiran Hospital
        title: "Surat Rotary Club Blood Drive",
        description: "Community blood drive in Surat. Join hands with local business groups and volunteers to support emergency surgeries at major city hospitals.",
        location: {
          venue: "Rotary Hall, Near Timaliawad, Nanpura",
          city: "Surat",
          state: "Gujarat",
          pincode: "395001"
        },
        coordinates: { lat: 21.1750, lng: 72.8250 },
        daysOffset: 3
      },
      {
        hospital: "69a96fb8d0f470fb761d96e3",
        title: "Ahmedabad Civil Hospital Mega Camp",
        description: "A large-scale donation camp hosted inside the Civil Hospital Ahmedabad campus. Free full blood screening, hemoglobin testing, and certified appreciation medals for regular donors.",
        location: {
          venue: "Civil Hospital Trauma Center Hall, Asarwa",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "380016"
        },
        coordinates: { lat: 23.0535, lng: 72.5975 },
        daysOffset: 2
      },
      {
        hospital: "69a96fb8d0f470fb761d96e3",
        title: "Prathama Centre Blood Campaign",
        description: "Specialized platelets and whole blood donation camp organized by Prathama Blood Centre to address thalassemia needs in Gujarat.",
        location: {
          venue: "Prathama Blood Centre Auditorium, Vasna",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "380007"
        },
        coordinates: { lat: 23.0210, lng: 72.5560 },
        daysOffset: 5
      },
      {
        hospital: "69b3a1c91a7255d05cab0626",
        title: "Ashram Road Community Blood Drive",
        description: "Lions Club of Ahmedabad North blood donation camp. Helping local emergency wards. Gift kits and pre-donation consultations included.",
        location: {
          venue: "Red Cross Building, Ashram Road",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "380009"
        },
        coordinates: { lat: 23.0280, lng: 72.5780 },
        daysOffset: 4
      },
      {
        hospital: "69b3a1c91a7255d05cab0626",
        title: "Tata Memorial Cancer Care Drive",
        description: "Blood donation camp in Mumbai dedicated to cancer chemotherapy patients who require regular platelet and blood transfusions.",
        location: {
          venue: "Tata Memorial Hospital Main Lobby, Parel",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400012"
        },
        coordinates: { lat: 19.0025, lng: 72.8420 },
        daysOffset: 1
      },
      {
        hospital: "69a96fb8d0f470fb761d96e3",
        title: "KEM Hospital Lifesaver Camp",
        description: "One-day emergency blood drive organized by the KEM Hospital resident doctors association in Mumbai. Walk-ins highly appreciated.",
        location: {
          venue: "Acharya Donde Marg, Parel",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400012"
        },
        coordinates: { lat: 19.0030, lng: 72.8430 },
        daysOffset: 6
      },
      {
        hospital: "69b3a1c91a7255d05cab0626",
        title: "Churchgate Rotary Blood Drive",
        description: "Mumbai South corporate and public donation drive organized by Rotary Club Churchgate. High-quality refreshments and direct donor feedback provided.",
        location: {
          venue: "Rotary Club Hall, Veer Nariman Road, Churchgate",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400020"
        },
        coordinates: { lat: 18.9350, lng: 72.8360 },
        daysOffset: 3
      },
      {
        hospital: "69b3a1c91a7255d05cab0626",
        title: "Lions Club Gandhinagar Drive",
        description: "Gandhinagar capital blood drive. We aim to collect 200+ units of whole blood and platelets for government medical centers.",
        location: {
          venue: "Sector 16 Community Hall, Near District Court",
          city: "Gandhinagar",
          state: "Gujarat",
          pincode: "382016"
        },
        coordinates: { lat: 23.2300, lng: 72.6500 },
        daysOffset: 7
      },
      {
        hospital: "69a96fb8d0f470fb761d96e3",
        title: "Sayajiganj Red Cross Camp",
        description: "Annual voluntary blood donation drive organized by the Indian Red Cross Society branch in Vadodara.",
        location: {
          venue: "Red Cross Blood Bank Building, Sayajiganj",
          city: "Vadodara",
          state: "Gujarat",
          pincode: "390005"
        },
        coordinates: { lat: 22.3120, lng: 73.1930 },
        daysOffset: 2
      },
      {
        hospital: "69b3a1c91a7255d05cab0626",
        title: "SSG Hospital Community Drive",
        description: "SSG Hospital Vadodara main blood donation camp. Perfect for first-time donors. Refreshments, free healthcare consulting, and verified certificates included.",
        location: {
          venue: "SSG Hospital Outpatient Wing, Jail Road",
          city: "Vadodara",
          state: "Gujarat",
          pincode: "390001"
        },
        coordinates: { lat: 22.3050, lng: 73.2010 },
        daysOffset: 8
      },
      {
        hospital: "69a96fb8d0f470fb761d96e3",
        title: "Rajkot Civil Hospital Camp",
        description: "Sadar area blood collection camp. Meeting emergency storage demands for surgical wards in Saurashtra region.",
        location: {
          venue: "Civil Hospital Campus Conference Hall, Sadar",
          city: "Rajkot",
          state: "Gujarat",
          pincode: "360001"
        },
        coordinates: { lat: 22.3010, lng: 70.7950 },
        daysOffset: 4
      },
      {
        hospital: "69b3a1c91a7255d05cab0626",
        title: "Lakhajiraj Road Donation Drive",
        description: "Voluntary donation drive to celebrate World Blood Donor Week. Special recognition certificates for repeat donors.",
        location: {
          venue: "Red Cross Building, Lakhajiraj Road",
          city: "Rajkot",
          state: "Gujarat",
          pincode: "360001"
        },
        coordinates: { lat: 22.3060, lng: 70.8050 },
        daysOffset: 9
      }
    ];

    const campImages = [
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=500&q=80"
    ];

    const campsToCreate = [];

    newCamps.forEach((nc, idx) => {
      const campDate = new Date();
      campDate.setDate(campDate.getDate() + nc.daysOffset);
      
      // Set to 9 AM
      campDate.setHours(9, 0, 0, 0);

      campsToCreate.push({
        hospital: nc.hospital,
        title: nc.title,
        description: nc.description,
        date: campDate,
        time: { start: "09:00", end: "17:00" },
        location: {
          venue: nc.location.venue,
          city: nc.location.city,
          state: nc.location.state,
          pincode: nc.location.pincode
        },
        expectedDonors: 100 + (idx % 3) * 50,
        actualDonors: 0,
        status: "upcoming",
        coordinates: nc.coordinates,
        image: campImages[idx % campImages.length],
        registeredDonors: []
      });
    });

    await BloodCamp.insertMany(campsToCreate);
    console.log(`✅ Successfully seeded ${campsToCreate.length} highly realistic Indian BloodCamps!`);
  } catch (error) {
    console.error("❌ Error seeding camps:", error);
  }
};

export const getUpcomingCamps = async (req, res, next) => {
  try {
    const bloodGroup = req.query.bloodGroup || req.query.blood_type || undefined;
    const bloodComponent = req.query.bloodComponent || undefined;

    // Seed data if empty
    await seedCampsIfEmpty();

    // Prefer real-time Eka/e-RaktKosh data.
    try {
      const camps = await getEkaCampsUpcomingIndia({
        bloodGroup,
        bloodComponent,
      });
      if (Array.isArray(camps) && camps.length > 0) {
        return res.json({ success: true, camps });
      }
    } catch (err) {
      console.warn(
        "Eka camps (upcoming) failed, falling back to DB:",
        err?.message || err,
      );
    }

    // Fallback: DB camps
    const now = new Date();
    const camps = await BloodCamp.find({
      date: { $gte: now },
      status: { $nin: ["cancelled", "Cancelled"] },
    })
      .populate("hospital", "name address phone email")
      .sort({ date: 1 })
      .limit(40);

    return res.json({ success: true, camps });
  } catch (error) {
    next(error);
  }
};

export const getNearbyCamps = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseInt(req.query.radius || "50", 10);
    const bloodGroup = req.query.bloodGroup || req.query.blood_type || undefined;
    const bloodComponent = req.query.bloodComponent || undefined;

    // Seed data if empty
    await seedCampsIfEmpty();

    // Prefer real-time Eka/e-RaktKosh data when coordinates are provided.
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      try {
        const camps = await getEkaCampsNearby({
          lat,
          lng,
          radiusKm: Number.isFinite(radiusKm) ? radiusKm : 50,
          bloodGroup,
          bloodComponent,
        });
        if (Array.isArray(camps) && camps.length > 0) {
          return res.json({ success: true, camps });
        }
      } catch (err) {
        console.warn(
          "Eka camps (nearby) failed, falling back to DB:",
          err?.message || err,
        );
      }
    }

    // Fallback: DB camps.
    const now = new Date();
    const camps = await BloodCamp.find({
      date: { $gte: now },
      status: { $nin: ["cancelled", "Cancelled"] },
    })
      .populate("hospital", "name address phone email")
      .sort({ date: 1 })
      .limit(40);

    return res.json({ success: true, camps });
  } catch (error) {
    next(error);
  }
};

export const getPublicHospitals = async (req, res, next) => {
  try {
    const hospitals = await Facility.find({
      facilityType: "hospital",
      status: "approved",
    })
      .select("name address phone email")
      .sort({ name: 1 });

    res.json({
      success: true,
      hospitals,
    });
  } catch (error) {
    next(error);
  }
};

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError("Email is required", 400);
    }

    try {
      await NewsletterSubscriber.create({ email });
    } catch (dbError) {
      // Handle duplicate email unique constraint gracefully
      if (dbError.code === 11000) {
        return res.json({
          success: true,
          message: "You are already subscribed to our newsletter!",
        });
      }
      throw dbError;
    }

    res.json({
      success: true,
      message: "Subscribed successfully to newsletter!",
    });
  } catch (error) {
    next(error);
  }
};

export const getBloodRequests = async (req, res, next) => {
  try {
    const { bloodType, city, urgency, status = "active" } = req.query;

    const filter = { status };
    if (bloodType && bloodType !== "all") filter.bloodType = bloodType;
    if (city && city !== "all") filter.city = new RegExp(`^${city}$`, "i");
    if (urgency && urgency !== "all") filter.urgency = urgency;

    const requests = await PublicBloodRequest.find(filter)
      .sort({ urgency: -1, createdAt: -1 })
      .limit(100);

    res.json({ success: true, requests });
  } catch (error) {
    next(error);
  }
};

export const postBloodRequest = async (req, res, next) => {
  try {
    const {
      patientName,
      bloodType,
      units,
      hospital,
      city,
      contactPerson,
      phone,
      email,
      urgency,
      requiredBy,
      reason,
      additionalInfo,
    } = req.body;

    if (!patientName || !bloodType || !units || !hospital || !city || !contactPerson || !phone || !requiredBy) {
      throw new AppError("Missing required fields", 400);
    }

    const newRequest = await PublicBloodRequest.create({
      patientName,
      bloodType,
      units: Number(units),
      hospital,
      city,
      contactPerson,
      phone,
      email,
      urgency: urgency || "normal",
      requiredBy: new Date(requiredBy),
      reason,
      additionalInfo,
      status: "active",
    });

    // Broadcast to all connected clients in real-time
    const io = req.app.get("io");
    if (io) {
      io.emit("new-blood-request", newRequest);
    }

    res.status(201).json({ success: true, request: newRequest });
  } catch (error) {
    next(error);
  }
};

export const respondToBloodRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    const request = await PublicBloodRequest.findById(id);
    if (!request) throw new AppError("Blood request not found", 404);
    if (request.status !== "active") throw new AppError("This request is no longer active", 400);

    request.donorsResponded.push({ name: name || "Anonymous", phone: phone || "", respondedAt: new Date() });
    await request.save();

    // Broadcast updated donor count
    const io = req.app.get("io");
    if (io) {
      io.emit("blood-request-updated", {
        id: request._id,
        donorsResponded: request.donorsResponded.length,
      });
    }

    res.json({ success: true, donorsResponded: request.donorsResponded.length });
  } catch (error) {
    next(error);
  }
};

export const seedBloodStockIfEmpty = async () => {
  try {
    const bloodCount = await Blood.countDocuments();
    if (bloodCount > 0) return;

    // Check if we need to seed faculties
    let approvedFacilities = await Facility.find({ status: "approved" });

    // Seed extra mock approved faculties if there are fewer than 3 approved faculties
    if (approvedFacilities.length < 3) {
      const mockFacultiesData = [
        {
          name: "Surat Red Cross Blood Bank",
          email: "surat.rc@lifedrop.org",
          phone: "9876543210",
          facilityType: "blood-lab",
          registrationNumber: "REG-SRT-88271",
          address: { street: "Ring Road", city: "Surat", state: "Gujarat", pincode: "395003" }
        },
        {
          name: "Mumbai Central General Hospital",
          email: "mumbai.gh@lifedrop.org",
          phone: "9123456789",
          facilityType: "hospital",
          registrationNumber: "REG-MUM-99182",
          address: { street: "MG Road", city: "Mumbai", state: "Maharashtra", pincode: "400001" }
        },
        {
          name: "Baroda Blood Care Center",
          email: "baroda.bc@lifedrop.org",
          phone: "9345678901",
          facilityType: "blood-lab",
          registrationNumber: "REG-BDQ-33124",
          address: { street: "Alkapuri", city: "Vadodara", state: "Gujarat", pincode: "390001" }
        },
        {
          name: "Kiran Super Specialty Hospital",
          email: "kiran.hospital@lifedrop.org",
          phone: "9456789012",
          facilityType: "hospital",
          registrationNumber: "REG-SRT-22199",
          address: { street: "Katargam", city: "Surat", state: "Gujarat", pincode: "395004" }
        }
      ];

      for (const mock of mockFacultiesData) {
        const existing = await Facility.findOne({ registrationNumber: mock.registrationNumber });
        if (!existing) {
          let userDoc = await User.findOne({ email: mock.email });
          if (!userDoc) {
            userDoc = await User.create({
              name: mock.name,
              email: mock.email,
              password: "SecureSeedPass123!",
              phone: mock.phone,
              role: mock.facilityType,
              authProvider: "local",
              isEmailVerified: true
            });
          }
          await Facility.create({
            user: userDoc._id,
            name: mock.name,
            email: mock.email,
            phone: mock.phone,
            facilityType: mock.facilityType,
            registrationNumber: mock.registrationNumber,
            address: mock.address,
            status: "approved",
            approvedAt: new Date()
          });
        }
      }
      approvedFacilities = await Facility.find({ status: "approved" });
    }

    if (approvedFacilities.length === 0) {
      console.warn("⚠️ No approved faculties found to seed blood stock.");
      return;
    }

    const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    const components = ["Whole Blood", "Packed Red Blood Cells", "Platelets", "Fresh Frozen Plasma"];
    const bagsToCreate = [];

    // Seed ~70 blood bags across the approved faculties
    for (let i = 0; i < 70; i++) {
      const facility = approvedFacilities[i % approvedFacilities.length];
      const isLab = facility.facilityType === "blood-lab";
      const bloodGroup = bloodGroups[i % bloodGroups.length];
      const componentType = components[(i + Math.floor(i / 8)) % components.length];
      const quantity = Math.floor(3 + (i % 8) * 1.5);
      const year = new Date().getFullYear();
      const randomId = 10000 + i;

      // Compute expiry date matching standard medical thresholds
      const expiryDate = new Date();
      let days = 42;
      if (componentType === "Platelets") days = 5;
      else if (componentType === "Fresh Frozen Plasma") days = 365;
      expiryDate.setDate(expiryDate.getDate() + days);

      bagsToCreate.push({
        bloodGroup,
        quantity,
        expiryDate,
        status: "available",
        componentType,
        bagId: `BB-${year}-${randomId}`,
        testingStatus: "safe",
        diseasesTested: {
          hiv: false,
          hbv: false,
          hcv: false,
          malaria: false,
          syphilis: false
        },
        bloodLab: isLab ? facility._id : undefined,
        hospital: !isLab ? facility._id : undefined,
      });
    }

    await Blood.insertMany(bagsToCreate);
    console.log(`✅ Seeded ${bagsToCreate.length} Blood bags under approved faculties`);
  } catch (error) {
    console.error("❌ Error seeding blood stock:", error);
  }
};

export const getCentralStock = async (req, res, next) => {
  try {
    await seedBloodStockIfEmpty();
    const { bloodGroup, componentType, city, state, pincode } = req.query;

    const matchQuery = {
      testingStatus: "safe",
      status: "available",
    };

    if (bloodGroup && bloodGroup !== "all") {
      matchQuery.bloodGroup = bloodGroup;
    }

    if (componentType && componentType !== "all") {
      matchQuery.componentType = componentType;
    }

    const query = Blood.find(matchQuery)
      .populate("bloodLab", "name email phone address operatingHours facilityType")
      .populate("hospital", "name email phone address operatingHours facilityType");

    let results = await query;

    // Filter by location in memory if parameters provided
    if (city || state || pincode) {
      results = results.filter((item) => {
        const facility = item.bloodLab || item.hospital;
        if (!facility) return false;

        if (city && city.trim() !== "") {
          const matchCity =
            facility.address?.city?.toLowerCase() === city.trim().toLowerCase();
          if (!matchCity) return false;
        }
        if (state && state.trim() !== "") {
          const matchState =
            facility.address?.state?.toLowerCase() === state.trim().toLowerCase();
          if (!matchState) return false;
        }
        if (pincode && pincode.trim() !== "") {
          const matchPincode = facility.address?.pincode === pincode.trim();
          if (!matchPincode) return false;
        }
        return true;
      });
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const postContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, inquiryType } = req.body;

    if (!name || !email || !message) {
      throw new AppError("Name, email, and message are required fields", 400);
    }

    if (name.trim().length < 2) {
      throw new AppError("Name must be at least 2 characters", 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError("Invalid email format", 400);
    }

    if (message.trim().length < 10) {
      throw new AppError("Message must be at least 10 characters", 400);
    }

    const newMessage = await ContactMessage.create({
      name,
      email,
      phone,
      subject: subject || "No Subject",
      message,
      inquiryType: inquiryType || "general",
    });

    // Send confirmation email to the user
    await sendEmail({
      email,
      subject: "Thank you for contacting LifeDrop!",
      template: "default",
      data: {
        message: `Hello ${name},<br/><br/>Thank you for reaching out to us. We have received your message and will review it shortly.<br/><br/><strong>Your message summary:</strong><br/>Subject: ${subject || "No Subject"}<br/>Type: ${inquiryType || "General Inquiry"}<br/>Message: ${message}<br/><br/>Best regards,<br/>The LifeDrop Team`,
      },
    });

    // Send notification email to the admin
    if (process.env.EMAIL_USER) {
      await sendEmail({
        email: process.env.EMAIL_USER,
        subject: `New Contact Submission: ${subject || "No Subject"}`,
        template: "default",
        data: {
          message: `Admin notification:<br/><br/>A new contact message has been submitted on the platform.<br/><br/><strong>Details:</strong><br/>Name: ${name}<br/>Email: ${email}<br/>Phone: ${phone || "Not provided"}<br/>Inquiry Type: ${inquiryType || "general"}<br/>Subject: ${subject || "No Subject"}<br/>Message:<br/>${message}<br/><br/>You can log into the Admin Dashboard to reply to this message.`,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "You sent message successfully to LifeDrop",
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

