import express from "express";

const router = express.Router();

// POST /api/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  // Mock implementation: in a real app we would send an email.
  return res.json({
    success: true,
    message: "Password reset instructions have been sent to your email.",
  });
});

export default router;

