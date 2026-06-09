const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const ROLES = ["donor", "hospital", "blood-lab"];

export const validateFirebaseRegistrationPayload = (body, claims) => {
  const errors = [];

  if (!body.idToken) {
    errors.push("idToken is required");
  }

  if (!body.role || !ROLES.includes(body.role)) {
    errors.push("Valid role is required (donor, hospital, blood-lab)");
  }

  if (claims.firebaseUid && claims.firebaseUid !== body.firebaseUid) {
    errors.push("Token user id does not match profile data");
  }

  if (claims.email && body.email && claims.email !== body.email.toLowerCase()) {
    errors.push("Token email does not match profile data");
  }

  if (body.role === "donor") {
    if (!body.bloodGroup || !BLOOD_GROUPS.includes(body.bloodGroup)) {
      errors.push("Valid blood group is required for donors");
    }
    const age = Number(body.age);
    if (!age || age < 18 || age > 65) {
      errors.push("Donor age must be between 18 and 65");
    }
    if (!body.gender) {
      errors.push("Gender is required for donors");
    }
  }

  if (body.role === "hospital" || body.role === "blood-lab") {
    if (!body.registrationNumber?.trim()) {
      errors.push("Registration / license number is required");
    }
  }

  if (!body.street?.trim()) errors.push("Street address is required");
  if (!body.city?.trim()) errors.push("City is required");
  if (!body.state?.trim()) errors.push("State is required");
  if (!body.pincode || !/^[1-9][0-9]{5}$/.test(body.pincode)) {
    errors.push("Valid 6-digit pincode is required");
  }

  if (body.phone && !/^[6-9][0-9]{9}$/.test(body.phone)) {
    errors.push("Phone must be a valid 10-digit Indian mobile number");
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(". "));
    error.statusCode = 400;
    throw error;
  }

  return true;
};
