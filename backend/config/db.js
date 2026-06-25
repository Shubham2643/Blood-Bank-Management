// config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    // Some parts of the codebase may populate optional paths; don't crash requests on strict populate.
    mongoose.set("strictPopulate", false);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Detect if database supports transactions (is a replica set)
    try {
      const status = await mongoose.connection.db.admin().command({ hello: 1 });
      global.supportsTransactions = !!status.setName;
      console.log(`ℹ️ Transactions supported: ${global.supportsTransactions}`);
    } catch (err) {
      global.supportsTransactions = false;
      console.log(`⚠️ Failed to check replica set status, disabling transactions: ${err.message}`);
    }

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
