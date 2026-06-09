import Donor from "../models/donorModel.js";
import Faculty from "../models/facultyModel.js";
import Blood from "../models/bloodModel.js";
import BloodCamp from "../models/bloodCampModel.js";
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
      Faculty.countDocuments({ facultyType: "hospital", status: "approved" }),
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
    // For now, frontend will fall back to its default list if this is empty
    res.json({
      success: true,
      needs: [],
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
    if (count > 0) return;

    const hospitals = ["69a96fb8d0f470fb761d96e3", "69b3a1c91a7255d05cab0626"];
    const citiesData = [
      { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, state: "Gujarat", pincode: "380009" },
      { name: "Mumbai", lat: 19.0760, lng: 72.8777, state: "Maharashtra", pincode: "400001" },
      { name: "Surat", lat: 21.1702, lng: 72.8311, state: "Gujarat", pincode: "395003" },
      { name: "Rajkot", lat: 22.3039, lng: 70.8022, state: "Gujarat", pincode: "360001" },
      { name: "Vadodara", lat: 22.3072, lng: 73.1812, state: "Gujarat", pincode: "390001" },
      { name: "Gandhinagar", lat: 23.2156, lng: 72.6369, state: "Gujarat", pincode: "382010" },
      { name: "Bhavnagar", lat: 21.7645, lng: 72.1519, state: "Gujarat", pincode: "364001" },
      { name: "Jamnagar", lat: 22.4707, lng: 70.0577, state: "Gujarat", pincode: "361001" },
      { name: "Junagadh", lat: 21.5222, lng: 70.4579, state: "Gujarat", pincode: "362001" },
      { name: "Anand", lat: 22.5645, lng: 72.9289, state: "Gujarat", pincode: "388001" },
      { name: "Navsari", lat: 20.9467, lng: 72.9520, state: "Gujarat", pincode: "396445" },
      { name: "Vapi", lat: 20.3718, lng: 72.9082, state: "Gujarat", pincode: "396191" },
      { name: "Mehsana", lat: 23.5880, lng: 72.3693, state: "Gujarat", pincode: "384001" },
      { name: "Bharuch", lat: 21.7051, lng: 72.9959, state: "Gujarat", pincode: "392001" },
    ];

    const templates = [
      { title: "Mega Blood Donation Drive", venue: "Rotary Club Community Hall", desc: "Join us for a community blood donation drive. Help us meet local emergency needs. Donors will receive refreshments and certificates." },
      { title: "Lifesaver Donation Drive", venue: "Town Hall Compound", desc: "Every drop of blood is a gift of life. Your contribution can save up to three lives. Refreshments and pre-donation checkups will be provided." },
      { title: "Red Connect Camp", venue: "City Sports Center", desc: "Partnering with top hospitals to collect healthy blood. Secure and hygienic environment ensured. Walk-ins are highly encouraged." }
    ];

    const campsToCreate = [];

    citiesData.forEach((city, cityIdx) => {
      // Create 2 camps per city
      for (let i = 0; i < 2; i++) {
        const template = templates[(cityIdx + i) % templates.length];
        const hospitalId = hospitals[(cityIdx + i) % hospitals.length];
        
        const campDate = new Date();
        // Dates spread from tomorrow to 20 days out
        campDate.setDate(campDate.getDate() + 1 + (cityIdx % 3) * 3 + i * 4);
        
        campsToCreate.push({
          hospital: hospitalId,
          title: `${city.name} ${template.title}`,
          description: template.desc,
          date: campDate,
          time: { start: "09:00", end: "17:00" },
          location: {
            venue: `${template.venue}, Near Main Square`,
            city: city.name,
            state: city.state,
            pincode: city.pincode,
          },
          expectedDonors: 100 + (cityIdx % 3) * 50,
          actualDonors: 0,
          status: "upcoming",
          coordinates: {
            lat: city.lat + (Math.random() - 0.5) * 0.02,
            lng: city.lng + (Math.random() - 0.5) * 0.02,
          },
          registeredDonors: [],
        });
      }
    });

    await BloodCamp.insertMany(campsToCreate);
    console.log(`✅ Seeded ${campsToCreate.length} BloodCamp documents across all listed cities`);
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
    const hospitals = await Faculty.find({
      facultyType: "hospital",
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

    // No persistence for now – just acknowledge
    res.json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (error) {
    next(error);
  }
};

