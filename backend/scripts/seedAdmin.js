import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/UserModel.js";
import Admin from "./models/adminModel.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "System Admin";

    if (!email || !password) {
      console.error(
        "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running seed:admin",
      );
      process.exit(1);
    }

    if (password.length < 8) {
      console.error("ADMIN_PASSWORD must be at least 8 characters");
      process.exit(1);
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password,
        phone: "9999999999",
        role: "admin",
        authProvider: "local",
        isEmailVerified: true,
      });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
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
      console.log("Admin profile created");
    }

    console.log(`Admin seeded: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedAdmin();
