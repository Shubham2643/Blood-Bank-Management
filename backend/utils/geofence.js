import twilio from "twilio";
import Donor from "../models/donorModel.js";
import { notifyUser } from "./notification.js";

// Haversine formula to compute distance in kilometers between two coordinates
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Blood compatibility map for emergencies (who can donate to the requested type)
const COMPATIBILITY_MAP = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
};

/**
 * Triggers geofenced SMS and push alerts to matching donors within 10km of requesting hospital
 * @param {Object} bloodRequest - The created BloodRequest document
 * @param {Object} hospital - The requesting hospital Facility document
 */
export const sendGeofencedSMSAlerts = async (bloodRequest, hospital) => {
  try {
    const { bloodType, units, _id: requestId } = bloodRequest;
    
    // Ensure hospital has coordinates
    let hospLat = hospital.coordinates?.lat;
    let hospLng = hospital.coordinates?.lng;
    
    if (!hospLat || !hospLng) {
      // Fallback Ahmedabad center if not assigned
      hospLat = 23.0225;
      hospLng = 72.5714;
    }

    // Find compatible donor blood groups
    const compatibleGroups = COMPATIBILITY_MAP[bloodType] || [bloodType];

    // Find all donors matching compatible blood groups
    const donors = await Donor.find({
      bloodGroup: { $in: compatibleGroups },
      isEligible: true
    }).populate("user", "name phone");

    const notifiedDonors = [];

    for (const donor of donors) {
      // Skip if donor has no user reference
      if (!donor.user) continue;

      let donorLat = donor.coordinates?.lat;
      let donorLng = donor.coordinates?.lng;

      if (!donorLat || !donorLng) {
        // Fallback to donor city or Ahmedabad center
        donorLat = 23.0225;
        donorLng = 72.5714;
      }

      // Calculate distance
      const distance = getDistance(hospLat, hospLng, donorLat, donorLng);

      // Check 10km radius threshold
      if (distance <= 10.0) {
        const donorName = donor.user.name || "LifeDrop Donor";
        const donorPhone = donor.user.phone || donor.email || "";

        // Construct SMS message
        const smsMessage = `🚨 EMERGENCY ALERT: ${hospital.name} in Ahmedabad needs ${units} unit(s) of ${bloodType} blood immediately! You are within 10km. Please help save lives. Contact hospital: ${hospital.phone || "LifeDrop Admin"}.`;

        // Dispatch Twilio SMS if credentials are set
        if (
          process.env.TWILIO_ACCOUNT_SID &&
          process.env.TWILIO_AUTH_TOKEN &&
          process.env.TWILIO_PHONE_NUMBER
        ) {
          try {
            const client = twilio(
              process.env.TWILIO_ACCOUNT_SID,
              process.env.TWILIO_AUTH_TOKEN
            );
            await client.messages.create({
              body: smsMessage,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: donorPhone.startsWith("+") ? donorPhone : `+91${donorPhone}`,
            });
            console.log(`[Twilio SMS] Alert successfully sent to ${donorName} (${donorPhone})`);
          } catch (twilioErr) {
            console.error(`[Twilio SMS Error] Failed to send SMS to ${donorPhone}:`, twilioErr.message);
          }
        } else {
          // Log simulated alert
          console.log(`
=========================================
[SMS ALERT SIMULATION - TWILIO MOCK]
To: ${donorName} (${donorPhone})
Distance: ${distance.toFixed(2)} km
Message: ${smsMessage}
=========================================
          `);
        }

        // Send in-app push notification
        await notifyUser(
          donor.user._id,
          `🚨 EMERGENCY: ${hospital.name} requires ${units} units of ${bloodType} blood urgently! Click history/camps to help.`,
          "danger"
        );

        notifiedDonors.push({
          name: donorName,
          phone: donorPhone,
          distance: Math.round(distance * 100) / 100, // round to 2 decimals
        });
      }
    }

    return notifiedDonors;
  } catch (error) {
    console.error("Error in geofenced emergency alerts:", error);
    return [];
  }
};
