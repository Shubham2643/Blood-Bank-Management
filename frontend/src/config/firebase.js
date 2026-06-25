import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const cleanEnv = (value) =>
  String(value || "")
    .trim()
    .replace(/^["']|["'],?$/g, "")
    .replace(/,$/, "");

const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
};

const isFirebaseConfigured = () => {
  const keys = [
    firebaseConfig.apiKey,
    firebaseConfig.authDomain,
    firebaseConfig.projectId,
    firebaseConfig.appId,
  ];
  return keys.every(
    (k) =>
      k &&
      k.trim() !== "" &&
      k !== "undefined" &&
      k !== "null" &&
      !k.startsWith("your-"),
  );
};

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    app = null;
    auth = null;
    googleProvider = null;
  }
}

export { auth, googleProvider, isFirebaseConfigured };
