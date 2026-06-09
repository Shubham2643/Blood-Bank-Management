import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { sanitizeRequest } from "./middlewares/sanitize.js";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { errorHandler } from "./utils/errorHandler.js";
import { initializeSocket } from "./socket/index.js";

import authRoutes from "./routes/authRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import bloodLabRoutes from "./routes/bloodLabRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import forgotPasswordRoutes from "./routes/forgotPasswordRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const io = initializeSocket(server);
app.set("io", io);

const parseOrigins = () => {
  const raw = process.env.CLIENT_URL || "http://localhost:5173";
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
};

const allowedOrigins = parseOrigins();

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeRequest);
app.use(hpp());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 20 : 100,
  message: { success: false, message: "Too many auth attempts, try again later" },
});

app.use("/api", globalLimiter);

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/blood-lab", bloodLabRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api", newsletterRoutes);
app.use("/api", forgotPasswordRoutes);
app.use("/api/user", userRoutes);

app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

  res.status(dbState === 1 ? 200 : 503).json({
    success: dbState === 1,
    message: dbState === 1 ? "Server is healthy" : "Database not connected",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development",
    database: dbStatus[dbState] || "unknown",
    firebase: Boolean(process.env.FIREBASE_PROJECT_ID),
  });
});

if (process.env.SERVE_FRONTEND === "true") {
  const candidates = [
    process.env.FRONTEND_DIST,
    path.join(__dirname, "frontend-dist"),
    path.join(__dirname, "..", "frontend", "dist"),
  ].filter(Boolean);

  const frontendDist = candidates.find((dir) => fs.existsSync(dir));

  if (!frontendDist) {
    console.warn("SERVE_FRONTEND=true but no frontend dist folder found");
  } else {
    console.log(`Serving frontend from: ${frontendDist}`);
    app.use(express.static(frontendDist));
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }
}

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

export default app;
