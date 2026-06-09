import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import admin from "firebase-admin";

const FIREBASE_JWKS_URI =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const projectId = () =>
  process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

const jwks = jwksClient({
  jwksUri: FIREBASE_JWKS_URI,
  cache: true,
  cacheMaxAge: 10 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

const getSigningKey = (header, callback) => {
  if (!header?.kid) {
    callback(new Error("Token header missing key id (kid)"));
    return;
  }

  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, key.getPublicKey());
  });
};

const verifyWithJwks = (idToken, audience) =>
  new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getSigningKey,
      {
        algorithms: ["RS256"],
        audience,
        issuer: `https://securetoken.google.com/${audience}`,
      },
      (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      },
    );
  });

export const normalizeFirebaseClaims = (decoded) => ({
  uid: decoded.uid || decoded.sub || decoded.user_id,
  email: decoded.email?.toLowerCase()?.trim(),
  name: decoded.name,
  picture: decoded.picture,
  email_verified: Boolean(decoded.email_verified),
  sign_in_provider: decoded.firebase?.sign_in_provider || null,
  auth_time: decoded.auth_time,
  iat: decoded.iat,
  exp: decoded.exp,
});

export const validateFirebaseGoogleClaims = (claims) => {
  if (!claims.uid) {
    throw new Error("Invalid token: missing user id");
  }

  if (!claims.email) {
    throw new Error("Google account must have a verified email address");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(claims.email)) {
    throw new Error("Invalid email format in token");
  }

  if (claims.sign_in_provider && claims.sign_in_provider !== "google.com") {
    throw new Error("Only Google sign-in is allowed for this endpoint");
  }

  if (claims.exp && claims.exp * 1000 < Date.now()) {
    throw new Error("Token has expired. Please sign in again.");
  }

  return claims;
};

export const verifyFirebaseIdToken = async (idToken, firebaseAdminInstance) => {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("Firebase ID token is required");
  }

  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed Firebase ID token");
  }

  const audience = projectId();
  if (!audience) {
    throw new Error(
      "FIREBASE_PROJECT_ID is missing in backend/.env. Add it and restart the server.",
    );
  }

  let decoded;

  if (firebaseAdminInstance) {
    decoded = await firebaseAdminInstance.auth().verifyIdToken(idToken, true);
  } else {
    decoded = await verifyWithJwks(idToken, audience);
  }

  const claims = normalizeFirebaseClaims(decoded);
  return validateFirebaseGoogleClaims(claims);
};
