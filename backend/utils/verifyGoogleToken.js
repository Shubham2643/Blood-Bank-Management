import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const GOOGLE_JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";

const getClientId = () =>
  process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;

const jwks = jwksClient({
  jwksUri: GOOGLE_JWKS_URI,
  cache: true,
  cacheMaxAge: 24 * 60 * 60 * 1000,
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

export const verifyGoogleIdToken = (idToken) => {
  return new Promise((resolve, reject) => {
    if (!idToken || typeof idToken !== "string") {
      return reject(new Error("Google ID token is required"));
    }

    const parts = idToken.split(".");
    if (parts.length !== 3) {
      return reject(new Error("Malformed Google ID token"));
    }

    const audience = getClientId();
    if (!audience) {
      return reject(
        new Error(
          "GOOGLE_CLIENT_ID is missing in backend/.env. Add it and restart the server."
        )
      );
    }

    jwt.verify(
      idToken,
      getSigningKey,
      {
        algorithms: ["RS256"],
        audience,
        issuer: ["https://accounts.google.com", "accounts.google.com"],
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            googleId: decoded.sub,
            email: decoded.email?.toLowerCase()?.trim(),
            name: decoded.name,
            avatar: decoded.picture,
            emailVerified: Boolean(decoded.email_verified),
          });
        }
      }
    );
  });
};
