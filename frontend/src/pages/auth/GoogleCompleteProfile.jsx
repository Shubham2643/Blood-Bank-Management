import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Heart, Shield, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import Header from "../../components/Header";
import { authApi } from "../../services/api";
import {
  getDashboardPath,
  persistAuthSession,
} from "../../utils/rolePaths";
import { getFirebaseIdToken } from "../../utils/firebaseAuth";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function GoogleCompleteProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const firebaseProfile = location.state?.firebaseProfile;
  const storedIdToken = location.state?.idToken;

  const [role, setRole] = useState("donor");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    bloodGroup: "",
    age: "",
    gender: "Male",
    weight: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    registrationNumber: "",
  });

  if (!firebaseProfile) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Session expired
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in with Google (Firebase) again to complete your profile.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const idToken =
        (await getFirebaseIdToken(true)) || storedIdToken;

      if (!idToken) {
        toast.error("Session expired. Please sign in with Google again.");
        navigate("/login", { replace: true });
        return;
      }

      const { data } = await authApi.completeFirebaseRegistration({
        idToken,
        ...firebaseProfile,
        role,
        ...form,
      });

      persistAuthSession(data);
      toast.success("Account created successfully!");
      navigate(getDashboardPath(data.user.role), { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to complete registration",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Complete Your Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Signed in as {firebaseProfile.email}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 sm:p-8">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole("donor")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition ${
                  role === "donor"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                <Heart className="w-4 h-4" />
                Donor
              </button>
              <button
                type="button"
                onClick={() => setRole("hospital")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition ${
                  role === "hospital"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                <Shield className="w-4 h-4" />
                Hospital
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="phone"
                placeholder="Phone (10 digits, optional)"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />

              {role === "donor" ? (
                <>
                  <select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      name="age"
                      type="number"
                      placeholder="Age"
                      value={form.age}
                      onChange={handleChange}
                      required
                      className="px-4 py-3 border border-gray-300 rounded-xl"
                    />
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="px-4 py-3 border border-gray-300 rounded-xl"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              ) : (
                <input
                  name="registrationNumber"
                  placeholder="Hospital registration / license number"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />
              )}

              <input
                name="street"
                placeholder="Street address"
                value={form.street}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-xl"
                />
                <input
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-xl"
                />
              </div>
              <input
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
