import express from "express";
import {
  register,
  login,
  getProfile,
  logout,
  firebaseAuth,
  completeFirebaseRegistration,
} from "../controllers/authContoller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/firebase", firebaseAuth);
router.post("/firebase/complete", completeFirebaseRegistration);

router.get("/firebase/status", (req, res) => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  res.json({
    success: true,
    configured: Boolean(projectId),
    projectId: projectId || null,
    method: projectId ? "jwks-or-admin" : "not-configured",
  });
});
router.post("/logout", protect, logout);

router.get("/verify", protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      authProvider: req.user.authProvider,
    },
  });
});

router.post("/register/donor", (req, res, next) => {
  try {
    const body = req.body || {};
    if (body.bloodType && !body.bloodGroup) body.bloodGroup = body.bloodType;

    if (body.address && typeof body.address === "object") {
      body.street = body.street || body.address.street;
      body.city = body.city || body.address.city;
      body.state = body.state || body.address.state;
      body.pincode = body.pincode || body.address.pincode;
    }

    req.body = { ...body, role: "donor" };
    return register(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.post("/register/hospital", (req, res, next) => {
  try {
    const body = req.body || {};
    if (body.address && typeof body.address === "object") {
      body.street = body.street || body.address.street;
      body.city = body.city || body.address.city;
      body.state = body.state || body.address.state;
      body.pincode = body.pincode || body.address.pincode;
    }
    req.body = { ...body, role: "hospital" };
    return register(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.post("/register/blood-lab", (req, res, next) => {
  try {
    const body = req.body || {};
    if (body.address && typeof body.address === "object") {
      body.street = body.street || body.address.street;
      body.city = body.city || body.address.city;
      body.state = body.state || body.address.state;
      body.pincode = body.pincode || body.address.pincode;
    }
    req.body = { ...body, role: "blood-lab" };
    return register(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.get("/profile", protect, getProfile);

export default router;
