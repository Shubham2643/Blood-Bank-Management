import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getGoogleClientId } from "../../config/googleAuth";
import { authApi } from "../../services/api";
import {
  getDashboardPath,
  persistAuthSession,
} from "../../utils/rolePaths";

export default function GoogleAuthButton({ onNeedsProfile }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const clientId = getGoogleClientId();
    if (!clientId) return;

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.id) {
        clearInterval(interval);
        setGoogleLoaded(true);
        initializeGsi(clientId);
      } else if (attempts > 50) {
        clearInterval(interval);
        console.error("Google Identity Services script failed to load.");
      }
    }, 100);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeGsi = (clientId) => {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          shape: "rectangular",
        });
      }
    } catch (err) {
      console.error("Error initializing GSI:", err);
    }
  };

  const handleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      const idToken = response.credential;
      const { data } = await authApi.googleAuth(idToken);

      if (data.needsProfile) {
        const profile = data.googleProfile || {
          googleId: data.googleProfile?.googleId,
          email: data.googleProfile?.email,
          name: data.googleProfile?.name,
          avatar: data.googleProfile?.avatar,
        };

        if (onNeedsProfile) {
          onNeedsProfile({ ...profile, idToken });
        } else {
          navigate("/auth/google/complete", {
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
    } catch (error) {
      console.error("Google OAuth error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Google sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const clientId = getGoogleClientId();

  if (!clientId) {
    return (
      <p className="text-xs text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        Google Client ID is not configured. Add VITE_GOOGLE_CLIENT_ID to frontend
        .env and restart the dev server.
      </p>
    );
  }

  return (
    <div className="w-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20 rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-red-600" />
        </div>
      )}
      <div ref={buttonRef} id="google-signin-btn" className="w-full min-h-[44px]"></div>
      {!googleLoaded && (
        <div className="w-full flex items-center justify-center py-3 border border-gray-300 rounded-xl bg-white text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading Google Sign-In...
        </div>
      )}
    </div>
  );
}
