import { useState, useEffect, useCallback } from "react";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, isFirebaseConfigured } from "../../config/firebase";
import { authApi } from "../../services/api";
import {
  getDashboardPath,
  persistAuthSession,
} from "../../utils/rolePaths";

export default function GoogleAuthButton({ onNeedsProfile }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error) => {
    const code = error.code;
    if (code === "auth/popup-closed-by-user") {
      toast.error("Sign-in cancelled");
    } else if (code === "auth/configuration-not-found") {
      toast.error(
        "Enable Firebase Authentication and Google sign-in in Firebase Console.",
        { duration: 8000 },
      );
    } else if (code === "auth/unauthorized-domain") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        toast.error(
          "Add localhost to Firebase → Authentication → Authorized domains.",
          { duration: 8000 },
        );
      } else if (/^[0-9.]+$/.test(hostname)) {
        toast.error(
          `Unauthorized Domain: Firebase doesn't support authorizing IP addresses (${hostname}). To test Google Sign-in on mobile, connect via USB and run 'adb reverse tcp:5173 tcp:5173' to access via 'localhost:5173', or use a tunneling service (like ngrok).`,
          { duration: 12000 },
        );
      } else {
        toast.error(
          `Unauthorized Domain: Add '${hostname}' to Firebase → Authentication → Authorized domains.`,
          { duration: 10000 },
        );
      }
    } else {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Google sign-in failed. Please try again.",
      );
    }
  }, []);

  const handleAuthPayload = useCallback(async (user, idToken) => {
    const { data } = await authApi.firebaseAuth(idToken);

    if (data.needsProfile) {
      const profile = data.firebaseProfile || {
        firebaseUid: user.uid,
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL,
      };

      if (onNeedsProfile) {
        onNeedsProfile({ ...profile, idToken });
      } else {
        navigate("/auth/firebase/complete", {
          state: { firebaseProfile: profile, idToken },
        });
      }
      return;
    }

    if (!data.token || !data.user?.role) {
      throw new Error("Invalid server response. Please try again.");
    }

    persistAuthSession(data);
    toast.success("Signed in with Google!");
    navigate(getDashboardPath(data.user.role), { replace: true });
  }, [onNeedsProfile, navigate]);

  // Check redirect result on mount
  useEffect(() => {
    if (!auth || !isFirebaseConfigured()) return;

    const checkRedirectResult = async () => {
      try {
        setLoading(true);
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const idToken = await result.user.getIdToken(true);
          await handleAuthPayload(result.user, idToken);
        }
      } catch (error) {
        console.error("Redirect sign-in error on mount (can be ignored if not signing in with Google):", error);
      } finally {
        setLoading(false);
      }
    };

    checkRedirectResult();
  }, [handleAuthPayload, handleError]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Detect if user is on mobile/tablet to choose redirect vs popup
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      if (isMobile) {
        // Redirect flow is recommended and works much better on mobile browsers
        await signInWithRedirect(auth, googleProvider);
      } else {
        // Popup flow for desktop
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken(true);
        await handleAuthPayload(result.user, idToken);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      handleError(error);
      setLoading(false);
    }
  };

  if (!isFirebaseConfigured()) {
    return (
      <p className="text-xs text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        Firebase is not configured. Add VITE_FIREBASE_* variables to frontend
        .env and restart the dev server.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm transition disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </>
      )}
    </button>
  );
}
