import User from "../models/UserModel.js";
import Admin from "../models/adminModel.js";

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
