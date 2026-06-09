import { auth, isFirebaseConfigured } from "../config/firebase";

export const getFirebaseIdToken = async (forceRefresh = false) => {
  if (!isFirebaseConfigured() || !auth?.currentUser) {
    return null;
  }
  return auth.currentUser.getIdToken(forceRefresh);
};

export const getFirebaseUserProfile = () => {
  const user = auth?.currentUser;
  if (!user) return null;

  return {
    firebaseUid: user.uid,
    email: user.email,
    name: user.displayName,
    avatar: user.photoURL,
  };
};
