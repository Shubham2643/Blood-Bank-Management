import jwt from "jsonwebtoken";
import Faculty from "../models/facultyModel.js";

export const protectfaculty = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const facultyProfile = await Faculty.findOne({ user: decoded.id });
    if (!facultyProfile) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found",
      });
    }

    req.user = facultyProfile;
    req.baseUser = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    console.error("Faculty auth error:", error);
    res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

export const requireFacultyApproved = (req, res, next) => {
  if (req.user?.status !== "approved") {
    return res.status(403).json({
      success: false,
      message:
        "Your account is pending admin approval. You will gain access once approved.",
      status: req.user?.status || "pending",
    });
  }
  next();
};

export const requireFacultyType =
  (...types) =>
  (req, res, next) => {
    if (!req.user || !types.includes(req.user.facultyType)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
    }
    next();
  };
