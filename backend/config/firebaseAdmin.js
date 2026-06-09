import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  verifyFirebaseIdToken,
  validateFirebaseGoogleClaims,
  normalizeFirebaseClaims,
} from "../utils/verifyFirebaseToken.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getPrivateKey = () => {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
};

const loadServiceAccount = () => {
  const jsonPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.join(__dirname, "..", "firebase-service-account.json");

  if (!fs.existsSync(jsonPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch (error) {
    console.error("Failed to read Firebase service account JSON:", error.message);
    return null;
  }
};

const initFirebase = () => {
  if (admin.apps.length > 0) {
    return admin;
  }

  const serviceAccount = loadServiceAccount();

  if (
    serviceAccount?.project_id &&
    serviceAccount?.client_email &&
    serviceAccount?.private_key
  ) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin: service account JSON loaded");
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    console.log("Firebase Admin: credentials loaded from .env");
    return admin;
  }

  if (projectId) {
    console.log(
      `Firebase Auth: JWKS verification enabled for project "${projectId}"`,
    );
  } else {
    console.warn("Set FIREBASE_PROJECT_ID in backend/.env for Google sign-in.");
  }

  return null;
};

export const firebaseAdmin = initFirebase();

export const verifyFirebaseToken = async (idToken) =>
  verifyFirebaseIdToken(idToken, firebaseAdmin);

export { validateFirebaseGoogleClaims, normalizeFirebaseClaims };
