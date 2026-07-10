// controllers/authController.js
import User from "../models/UserModel.js";
import Donor from "../models/donorModel.js";
import facility from "../models/facilityModel.js";
import Admin from "../models/adminModel.js";
import { sendEmail } from "../utils/emailService.js";
import { generateToken, getRoleRedirect } from "../utils/token.js";
import { verifyGoogleIdToken } from "../utils/verifyGoogleToken.js";
import { validateGoogleRegistrationPayload } from "../utils/googleRegistrationValidator.js";
import { emitToAdmin, SocketEvents } from "../socket/index.js";
import { notifyRole } from "../utils/notification.js";

const buildAuthResponse = (user, roleData = null) => ({
  success: true,
  token: generateToken(user),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    authProvider: user.authProvider,
  },
  roleData,
  redirect: getRoleRedirect(user.role),
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { role, email, password, name, phone, ...roleSpecificData } =
      req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      // If user exists, ensure role-specific profile exists instead of blocking with an error.
      if (role === "donor") {
        let donorProfile = await Donor.findOne({ user: user._id });
        if (!donorProfile) {
          const donorData = {
            user: user._id,
            email,
            bloodGroup: roleSpecificData.bloodGroup,
            age: roleSpecificData.age,
            gender: roleSpecificData.gender,
            weight: roleSpecificData.weight,
            address: {
              street: roleSpecificData.street,
              city: roleSpecificData.city,
              state: roleSpecificData.state,
              pincode: roleSpecificData.pincode,
            },
          };
          donorProfile = await Donor.create(donorData);
        }
      } else if (role === "hospital" || role === "blood-lab") {
        let facilityProfile = await facility.findOne({ user: user._id });
        if (!facilityProfile) {
          facilityProfile = await facility.create({
            user: user._id,
            name,
            email,
            phone,
            facilityType: role,
            ...roleSpecificData,
          });
        }
      }

      return res.status(200).json({
        message: "Account already existed. Profile verified, you can log in now.",
        ...buildAuthResponse(user),
      });
    } else {
      // Create base user
      user = await User.create({
        name,
        email,
        password,
        phone,
        role,
      });

      const userId = user._id;

      // Create role-specific profile
      if (role === "donor") {
        const donorData = {
          user: userId,
          email,
          bloodGroup: roleSpecificData.bloodGroup,
          age: roleSpecificData.age,
          gender: roleSpecificData.gender,
          weight: roleSpecificData.weight,
          address: {
            street: roleSpecificData.street,
            city: roleSpecificData.city,
            state: roleSpecificData.state,
            pincode: roleSpecificData.pincode,
          },
        };
        const newDonor = await Donor.create(donorData);
        // Notify admin of new donor registration
        try {
          emitToAdmin(SocketEvents.NEW_DONOR_REGISTRATION, {
            donor: { id: newDonor._id, bloodGroup: newDonor.bloodGroup, city: newDonor.address?.city },
            message: `New donor registered: ${user.name} (${newDonor.bloodGroup})`,
            timestamp: new Date()
          });
        } catch (notifError) {
          console.error("Admin notification error:", notifError.message);
        }
      } else if (role === "hospital" || role === "blood-lab") {
        const newFacility = await facility.create({
          user: userId,
          name,
          email,
          phone,
          facilityType: role,
          ...roleSpecificData,
        });
        // Notify admin of new facility registration
        try {
          emitToAdmin(SocketEvents.NEW_FACILITY_REGISTRATION, {
            facility: { id: newFacility._id, name: newFacility.name, type: newFacility.facilityType, status: 'pending' },
            message: `New ${newFacility.facilityType} registered: ${newFacility.name}`,
            timestamp: new Date()
          });
          await notifyRole('admin', `New ${newFacility.facilityType} registration: ${newFacility.name} is awaiting approval`, 'info');
        } catch (notifError) {
          console.error("Admin notification error:", notifError.message);
        }
      }

      try {
        await sendEmail({
          email: user.email,
          subject: "Welcome to LifeDrop",
          template: "welcome",
          data: { name: user.name, role },
        });
      } catch (emailError) {
        console.warn("Welcome email failed:", emailError.message);
      }

      res.status(201).json({
        message:
          role === "donor"
            ? "Registration successful! You can now log in."
            : "Registration successful! Please wait for admin approval.",
        ...buildAuthResponse(user),
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (
      (user.authProvider === "firebase" || user.authProvider === "google") &&
      !user.password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact support.",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    let roleData = null;

    if (user.role === "donor") {
      roleData = await Donor.findOne({ user: user._id });
    } else if (user.role === "hospital" || user.role === "blood-lab") {
      roleData = await facility.findOne({ user: user._id });
      if (roleData) {
        roleData.history = roleData.history || [];
        roleData.history.push({
          eventType: "Login",
          description: `Successful login from ${email}`,
          date: new Date(),
        });
        await roleData.save();
      }
    } else if (user.role === "admin") {
      roleData = await Admin.findOne({ user: user._id });
    }

    res.json({
      message: "Login successful",
      ...buildAuthResponse(user, roleData),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    let profileData = {
      user: req.user,
    };

    // Get role-specific data
    if (req.user.role === "donor") {
      profileData.donor = await Donor.findOne({ user: req.user._id })
        .populate("donationHistory.facility", "address")
        .populate("user", "name email phone role");
    } else if (req.user.role === "hospital" || req.user.role === "blood-lab") {
      profileData.facility = await facility.findOne({ user: req.user._id });
    } else if (req.user.role === "admin") {
      profileData.admin = await Admin.findOne({ user: req.user._id });
    }

    res.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
};

// @desc    Google OAuth sign-in
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    const decoded = await verifyGoogleIdToken(idToken);

    const googleId = decoded.googleId;
    const email = decoded.email;
    const name = decoded.name || email?.split("@")[0];
    const picture = decoded.avatar;
    const emailVerified = decoded.emailVerified;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account email is required",
      });
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    }).select("+password");

    if (user) {
      const updates = {};
      if (!user.googleId) updates.googleId = googleId;
      if (picture && user.avatar !== picture) updates.avatar = picture;
      if (emailVerified) updates.isEmailVerified = true;
      updates.lastLogin = new Date();
      if (user.authProvider === "firebase" || user.authProvider === "local") {
        updates.authProvider = "google";
      }

      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates, { runValidators: false });
        user = await User.findById(user._id).select("+password");
      }
    } else {
      return res.status(200).json({
        success: true,
        needsProfile: true,
        googleProfile: {
          googleId,
          email,
          name,
          avatar: picture,
        },
        message: "Complete your profile to finish registration",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact support.",
      });
    }

    if (!user.lastLogin || Date.now() - new Date(user.lastLogin).getTime() > 1000) {
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    }

    let roleData = null;
    if (user.role === "donor") {
      roleData = await Donor.findOne({ user: user._id });
    } else if (user.role === "hospital" || user.role === "blood-lab") {
      roleData = await facility.findOne({ user: user._id });
      if (roleData) {
        roleData.history = roleData.history || [];
        roleData.history.push({
          eventType: "Login",
          description: `Successful login via Google from ${email}`,
          date: new Date(),
        });
        await roleData.save();
      }
    } else if (user.role === "admin") {
      roleData = await Admin.findOne({ user: user._id });
    }

    res.json({
      message: "Google sign-in successful",
      ...buildAuthResponse(user, roleData),
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({
      success: false,
      message:
        error.message || "Google authentication failed. Please try again.",
    });
  }
};

// @desc    Complete Google registration with role-specific profile
// @route   POST /api/auth/google/complete
// @access  Public
export const completeGoogleRegistration = async (req, res) => {
  try {
    const { idToken, googleId, email, name, avatar, role, phone, ...roleSpecificData } =
      req.body;

    const decoded = await verifyGoogleIdToken(idToken);

    validateGoogleRegistrationPayload(
      { idToken, googleId, email, role, phone, ...roleSpecificData },
      { googleId: decoded.googleId, email: decoded.email },
    );

    const existing = await User.findOne({
      $or: [{ googleId: decoded.googleId }, { email: decoded.email }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please sign in.",
      });
    }

    const user = await User.create({
      name: name || decoded.name || decoded.email.split("@")[0],
      email: decoded.email,
      role,
      phone: phone || undefined,
      googleId: decoded.googleId,
      authProvider: "google",
      avatar: avatar || decoded.avatar,
      isEmailVerified: decoded.emailVerified,
    });

    if (role === "donor") {
      await Donor.create({
        user: user._id,
        email,
        bloodGroup: roleSpecificData.bloodGroup || roleSpecificData.bloodType,
        age: roleSpecificData.age,
        gender: roleSpecificData.gender,
        weight: roleSpecificData.weight,
        address: {
          street: roleSpecificData.street || roleSpecificData.address?.street,
          city: roleSpecificData.city || roleSpecificData.address?.city,
          state: roleSpecificData.state || roleSpecificData.address?.state,
          pincode: roleSpecificData.pincode || roleSpecificData.address?.pincode,
        },
      });
    } else if (role === "hospital" || role === "blood-lab") {
      await facility.create({
        user: user._id,
        name: name || email.split("@")[0],
        email,
        phone,
        facilityType: role,
        registrationNumber:
          roleSpecificData.registrationNumber ||
          `GG-${Date.now().toString(36).toUpperCase()}`,
        address: {
          street:
            roleSpecificData.street ||
            roleSpecificData.address?.street ||
            "Pending",
          city:
            roleSpecificData.city || roleSpecificData.address?.city || "Pending",
          state:
            roleSpecificData.state ||
            roleSpecificData.address?.state ||
            "Pending",
          pincode:
            roleSpecificData.pincode ||
            roleSpecificData.address?.pincode ||
            "100001",
        },
        ...roleSpecificData,
      });
    }

    res.status(201).json({
      message:
        role === "donor"
          ? "Registration successful!"
          : "Registration successful! Please wait for admin approval.",
      ...buildAuthResponse(user),
    });
  } catch (error) {
    console.error("Google registration completion error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Update last logout if needed
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
