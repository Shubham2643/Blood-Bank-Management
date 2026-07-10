import User from "../models/UserModel.js";
import Admin from "../models/adminModel.js";
import Donor from "../models/donorModel.js";
import Facility from "../models/facilityModel.js";

export const seedAdminIfEmpty = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "System Admin";

    if (!email || !password) {
      console.warn("⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not configured in environment. Skipping admin auto-seeding.");
      return;
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        password,
        phone: "9999999999",
        role: "admin",
        authProvider: "local",
        isEmailVerified: true,
      });
      console.log("✅ Auto-seeded Admin User in DB");
    }

    const existingAdmin = await Admin.findOne({ user: user._id });
    if (!existingAdmin) {
      await Admin.create({
        user: user._id,
        permissions: [
          "manage_users",
          "manage_facilities",
          "view_reports",
          "manage_system",
        ],
      });
      console.log("✅ Auto-seeded Admin Profile in DB");
    }
  } catch (error) {
    console.error("❌ Auto-seeding admin failed:", error.message);
  }
};

export const seedDemoDataIfEmpty = async () => {
  try {
    const DEFAULT_PASSWORD = "password123";

    // Demo Facilities List
    const demoFacilities = [
      {
        name: "Metro Blood Bank & Lab",
        email: "metro@gmail.com",
        role: "blood-lab",
        facilityType: "blood-lab",
        registrationNumber: "REG-METRO-001",
        phone: "9876543210",
        address: { street: "101 Metro Tower", city: "Ahmedabad", state: "Gujarat", pincode: "380009" }
      },
      {
        name: "Apollo Blood Lab Services",
        email: "apollo@gmail.com",
        role: "blood-lab",
        facilityType: "blood-lab",
        registrationNumber: "REG-APOLLO-001",
        phone: "9876543211",
        address: { street: "Apollo Health Center", city: "Ahmedabad", state: "Gujarat", pincode: "380015" }
      },
      {
        name: "Kiran Hospital Admin",
        email: "kiran.hospital@gmail.com",
        role: "hospital",
        facilityType: "hospital",
        registrationNumber: "REG-KIRAN-001",
        phone: "9876543212",
        address: { street: "Kiran Hospital Road", city: "Surat", state: "Gujarat", pincode: "395004" }
      },
      {
        name: "Kiran Hospital Admin 2",
        email: "kiran.hospital2@gmail.com",
        role: "hospital",
        facilityType: "hospital",
        registrationNumber: "REG-KIRAN-002",
        phone: "9876543213",
        address: { street: "Kiran Tower Ext", city: "Surat", state: "Gujarat", pincode: "395004" }
      },
      {
        name: "Civil Hospital",
        email: "shubhamgajjar2604@gmail.com",
        role: "hospital",
        facilityType: "hospital",
        registrationNumber: "REG-CIVIL-001",
        phone: "9876543214",
        address: { street: "Asarwa Civil Campus", city: "Ahmedabad", state: "Gujarat", pincode: "380016" }
      },
      {
        name: "Civil Hospital 2",
        email: "shubhamcoders2643@gmail.com",
        role: "hospital",
        facilityType: "hospital",
        registrationNumber: "REG-CIVIL-002",
        phone: "9876543215",
        address: { street: "Civil Hospital Ext", city: "Ahmedabad", state: "Gujarat", pincode: "380016" }
      },
      {
        name: "Vidhi Patel Hospital",
        email: "viidhi2824@gmail.com",
        role: "hospital",
        facilityType: "hospital",
        registrationNumber: "REG-VIDHI-001",
        phone: "9876543216",
        address: { street: "Vidhi Health Campus", city: "Ahmedabad", state: "Gujarat", pincode: "380054" }
      }
    ];

    // Demo Donors List
    const demoDonors = [
      {
        name: "Shubham Gajjar",
        email: "shubham@gmail.com",
        role: "donor",
        bloodGroup: "B+",
        age: 25,
        gender: "Male",
        weight: 70,
        phone: "9824400001",
        address: { street: "Gajjar Street", city: "Ahmedabad", state: "Gujarat", pincode: "380001" }
      },
      {
        name: "Shubham Adiyecha",
        email: "shubhamadiyecha26@gmail.com",
        role: "donor",
        bloodGroup: "O+",
        age: 24,
        gender: "Male",
        weight: 68,
        phone: "9824467534",
        address: { street: "Adiyecha House", city: "Ahmedabad", state: "Gujarat", pincode: "380005" }
      },
      {
        name: "Rajkumar Sharma",
        email: "rajusharma.32005@gmail.com",
        role: "donor",
        bloodGroup: "A+",
        age: 21,
        gender: "Male",
        weight: 65,
        phone: "9824400003",
        address: { street: "Sharma Marg", city: "Vadodara", state: "Gujarat", pincode: "390001" }
      },
      {
        name: "Pragnesh Adiyecha",
        email: "pragnesh3319@gmail.com",
        role: "donor",
        bloodGroup: "O+",
        age: 27,
        gender: "Male",
        weight: 72,
        phone: "9824400004",
        address: { street: "Pragnesh Flat", city: "Ahmedabad", state: "Gujarat", pincode: "380007" }
      }
    ];

    // Seed Facilities
    for (const df of demoFacilities) {
      const email = df.email.toLowerCase().trim();
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: df.name,
          email,
          password: DEFAULT_PASSWORD,
          phone: df.phone,
          role: df.role,
          authProvider: "local",
          isEmailVerified: true,
          isActive: true
        });
        console.log(`✅ Seeded User for demo facility: ${email}`);
      }

      let facility = await Facility.findOne({ user: user._id });
      if (!facility) {
        await Facility.create({
          user: user._id,
          name: df.name,
          email,
          phone: df.phone,
          facilityType: df.facilityType,
          registrationNumber: df.registrationNumber,
          address: df.address,
          status: "approved" // Pre-approved so it works instantly!
        });
        console.log(`✅ Seeded Facility Profile for: ${df.name}`);
      }
    }

    // Seed Donors
    for (const dd of demoDonors) {
      const email = dd.email.toLowerCase().trim();
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: dd.name,
          email,
          password: DEFAULT_PASSWORD,
          phone: dd.phone,
          role: dd.role,
          authProvider: "local",
          isEmailVerified: true,
          isActive: true
        });
        console.log(`✅ Seeded User for demo donor: ${email}`);
      }

      let donor = await Donor.findOne({ user: user._id });
      if (!donor) {
        await Donor.create({
          user: user._id,
          email,
          bloodGroup: dd.bloodGroup,
          age: dd.age,
          gender: dd.gender,
          weight: dd.weight,
          address: dd.address,
          isEligible: true
        });
        console.log(`✅ Seeded Donor Profile for: ${dd.name}`);
      }
    }

  } catch (error) {
    console.error("❌ Auto-seeding demo data failed:", error.message);
  }
};
