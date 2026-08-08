import { useEffect, useState, useCallback } from "react";
import { donorApi } from "../../services/api.js";
import { toast, Toaster } from "react-hot-toast";
import {
  Loader2,
  Save,
  Edit3,
  X,
  MapPin,
  Mail,
  Phone,
  User,
  Shield,
  Heart,
  Droplet,
  Calendar,
  Scale,
  Droplets,
  Award,
  AlertCircle,
  TrendingUp,
  Copy,
  Check,
  Activity,
} from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" }
];

const DonorProfile = () => {
  const [donor, setDonor] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    age: "",
    gender: "",
    weight: "",
    bloodGroup: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    password: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const validationRules = {
    fullName: { required: true, minLength: 2, maxLength: 50 },
    phone: { required: true, pattern: /^[0-9]{10}$/ },
    age: { required: true, min: 18, max: 65 },
    gender: { required: true },
    weight: { required: true, min: 45, max: 200 },
    bloodGroup: { required: true },
    "address.street": { required: true, minLength: 5 },
    "address.city": { required: true, minLength: 2 },
    "address.state": { required: true, minLength: 2 },
    "address.pincode": { required: true, pattern: /^[0-9]{6}$/ },
    password: { minLength: 6 }
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    if (rules.required && !value) {
      return "This field is required";
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} characters required`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} characters allowed`;
    }

    if (rules.min && Number(value) < rules.min) {
      return `Minimum value is ${rules.min}`;
    }

    if (rules.max && Number(value) > rules.max) {
      return `Maximum value is ${rules.max}`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return "Invalid format";
    }

    return null;
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authorization token found.");
      }

      const { data } = await donorApi.getProfile();
      const lastDonationDate = data.donor.lastDonationDate || data.donor.lastDonation;

      if (data.donor) {
        const resolvedDonor = {
          ...data.donor,
          lastDonation: lastDonationDate,
          status: data.donor.status || "active",
          donorId: data.donor.donorId || data.donor.id || data.donor._id,
        };

        setDonor(resolvedDonor);
        setFormData({
          fullName: resolvedDonor.fullName || "",
          phone: resolvedDonor.phone || "",
          age: resolvedDonor.age || "",
          gender: resolvedDonor.gender || "",
          weight: resolvedDonor.weight || "",
          bloodGroup: resolvedDonor.bloodGroup || "",
          address: {
            street: resolvedDonor.address?.street || "",
            city: resolvedDonor.address?.city || "",
            state: resolvedDonor.address?.state || "",
            pincode: resolvedDonor.address?.pincode || "",
          },
          password: ""
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("❌ Fetch Donor Profile Error:", error);
      let message;

      if (
        error.message.includes("No authorization token found") ||
        error.response?.status === 401
      ) {
        message = "Session expired or unauthorized. Please log in.";
        localStorage.removeItem("token");
        setDonor(null);
        toast.error(message);
        return;
      }

      message = error.response?.data?.message || "Failed to load profile";
      toast.error(message);
      setDonor(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          address: { ...prev.address, [key]: value },
        };
        validateField(name, value);
        return updatedData;
      });
    } else {
      setFormData((prev) => {
        const updatedData = { ...prev, [name]: value };
        validateField(name, value);
        return updatedData;
      });
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(key => {
      if (key === "password" && !formData.password) return;
      
      let value;
      if (key.startsWith("address.")) {
        const addressKey = key.split(".")[1];
        value = formData.address[addressKey];
      } else {
        value = formData[key];
      }
      
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix validation errors before saving");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required to save changes.");
        setSaving(false);
        return;
      }

      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        weight: Number(formData.weight),
        bloodGroup: formData.bloodGroup,
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          pincode: formData.address.pincode.trim(),
        },
      };

      if (formData.password && formData.password.length >= 6) {
        payload.password = formData.password;
      }

      const { data } = await donorApi.updateProfile(payload);

      if (data.success) {
        toast.success("Profile updated successfully! 🎉");
        const lastDonationDate = data.donor.lastDonationDate || data.donor.lastDonation;
        const resolvedDonor = {
          ...data.donor,
          lastDonation: lastDonationDate,
          status: data.donor.status || "active",
          donorId: data.donor.donorId || data.donor.id || data.donor._id,
        };

        setDonor(resolvedDonor);
        setIsEditing(false);
        setErrors({});
        setFormData(prev => ({ ...prev, password: "" }));

        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({
          ...currentUser,
          name: resolvedDonor.fullName || resolvedDonor.name || currentUser.name,
          phone: resolvedDonor.phone || currentUser.phone
        }));

        window.dispatchEvent(new Event("user-profile-updated"));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("❌ Update Donor Profile Error:", error);
      let message = error.response?.data?.message || "Failed to update profile";
      toast.error(message);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    if (donor) {
      setFormData({
        fullName: donor.fullName || "",
        phone: donor.phone || "",
        age: donor.age || "",
        gender: donor.gender || "",
        weight: donor.weight || "",
        bloodGroup: donor.bloodGroup || "",
        address: {
          street: donor.address?.street || "",
          city: donor.address?.city || "",
          state: donor.address?.state || "",
          pincode: donor.address?.pincode || "",
        },
        password: ""
      });
    }
  };

  const copyToClipboard = () => {
    if (donor && donor.donorId) {
      navigator.clipboard.writeText(donor.donorId);
      setCopied(true);
      toast.success("Donor ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading && !donor) {
    return (
      <div className="flex items-center justify-center py-24 min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-ping" />
            <div className="relative bg-white p-4 rounded-full shadow-md border border-red-100 flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Loading your profile...</h3>
          <p className="text-sm text-slate-500 max-w-xs">Retrieving your hero records...</p>
        </div>
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center bg-white rounded-3xl shadow-xl border border-red-100 p-10 max-w-md">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Failed to Load Profile
          </h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            We couldn't retrieve your profile data. Please make sure your internet is working and you are logged in.
          </p>
          <button
            onClick={fetchProfile}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-red-200 hover:shadow-xl cursor-pointer"
          >
            Retry Loading Profile
          </button>
        </div>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;
  const totalDonations = donor.donationHistory?.length || 0;
  const currentTier = totalDonations >= 10 ? "Gold" : totalDonations >= 5 ? "Silver" : "Bronze";
  const nextLevel = totalDonations < 5 ? "Silver" : totalDonations < 10 ? "Gold" : "Max Level";
  const targetDonations = totalDonations < 5 ? 5 : totalDonations < 10 ? 10 : 10;
  const progress = totalDonations >= 10 ? 100 : totalDonations < 5 ? (totalDonations / 5) * 100 : ((totalDonations - 5) / 5) * 100;

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <Toaster />

      {/* Ultra-Premium Glassmorphic Profile Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-800 via-rose-700 to-red-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_-15px_rgba(190,18,60,0.3)] border border-red-500/40 transition-all duration-300">
        {/* Animated Background Mesh & Concentric Rings */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="90" cy="10" r="35" stroke="white" strokeWidth="1.5" fill="none" />
            <circle cx="90" cy="10" r="25" stroke="white" strokeWidth="1.5" fill="none" />
            <circle cx="10" cy="90" r="30" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-red-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-6 justify-between items-center lg:items-end">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end text-center sm:text-left">
            {/* Sleek Circular Gradient Avatar with Pulse Ring & Verified Badge */}
            <div className="relative group flex-shrink-0">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-rose-400 via-white to-red-300 rounded-full blur-md opacity-40 group-hover:opacity-70 transition duration-300 animate-pulse" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-red-600 text-white font-black text-4xl sm:text-5xl flex items-center justify-center shadow-2xl border-4 border-white ring-4 ring-white/20 transition-transform duration-300 group-hover:scale-105">
                {(donor.fullName || donor.name || "D").charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-md shadow-emerald-500/30" title="Verified Active Donor">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
            </div>

            {/* Title, Badges & Integrated Stats Bar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white drop-shadow-md">
                  {donor.fullName || donor.name || "Donor Profile"}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  Active Hero
                </span>
              </div>

              {/* Header Stats Counter Pills */}
              <div className="flex flex-wrap gap-2.5 items-center justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white/15 backdrop-blur-md text-white border border-white/20 text-xs font-black shadow-2xs">
                  <Droplet className="w-3.5 h-3.5 text-red-300 fill-red-300" />
                  Blood: {donor.bloodGroup || "O+"}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white/15 backdrop-blur-md text-white border border-white/20 text-xs font-black shadow-2xs">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  Tier: {currentTier}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white/15 backdrop-blur-md text-white border border-white/20 text-xs font-black shadow-2xs">
                  <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
                  {totalDonations * 3} Lives Saved
                </span>

                {donor.donorId && (
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md text-xs font-mono transition-all cursor-pointer shadow-2xs hover:scale-105"
                    title="Copy Donor ID"
                  >
                    <span>ID: {donor.donorId}</span>
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-white/70" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex gap-3 flex-shrink-0 z-10 w-full sm:w-auto justify-center sm:justify-end">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-2xl font-black text-xs uppercase tracking-wider border border-white/25 transition-all cursor-pointer shadow-sm hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || hasErrors}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-red-700 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-black/10 flex items-center gap-2 hover:scale-105"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                  ) : (
                    <Save className="w-4 h-4 text-red-600" />
                  )}
                  <span>Save Profile</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-white hover:bg-slate-100 text-red-700 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Edit3 className="w-4 h-4 text-red-600" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Status & Vitals Widgets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Donor Status Card */}
          <div className="bg-white rounded-3xl shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-slate-200/80 p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-850 tracking-tight">Donor Status</h3>
                <p className="text-xs text-slate-400 font-medium">Account status and donation tier</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                  donor.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {donor.status?.toUpperCase() || "ACTIVE"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Blood Group</span>
                <span className="text-xs font-black text-red-600 bg-red-50 px-3 py-1 rounded-xl border border-red-100">
                  {donor.bloodGroup || "O+"}
                </span>
              </div>

              {donor.lastDonation && (
                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Last Donation</span>
                  <span className="text-xs font-bold text-slate-700">
                    {new Date(donor.lastDonation).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Achievement Bar */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-black text-slate-700">
                <span className="capitalize">{currentTier} Tier</span>
                <span>{totalDonations} / {targetDonations} Donations</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/60 p-0.5">
                <div
                  className="bg-gradient-to-r from-red-600 to-rose-600 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {totalDonations >= 10
                  ? "Maximum level unlocked! Thank you, Hero!"
                  : `${targetDonations - totalDonations} more donations to reach ${nextLevel}.`}
              </p>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white rounded-3xl shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-slate-200/80 p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-850 tracking-tight">Quick Vitals</h3>
                <p className="text-xs text-slate-400 font-medium">Registered contact info</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                <div className="w-9 h-9 rounded-xl bg-white text-red-600 flex items-center justify-center font-bold shadow-2xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Email</span>
                  <span className="block text-xs font-bold text-slate-800 truncate" title={donor.email}>
                    {donor.email}
                  </span>
                </div>
              </div>

              {donor.phone && (
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                  <div className="w-9 h-9 rounded-xl bg-white text-red-600 flex items-center justify-center font-bold shadow-2xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone</span>
                    <span className="block text-xs font-bold text-slate-800 truncate">
                      {donor.phone}
                    </span>
                  </div>
                </div>
              )}

              {donor.age && (
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                  <div className="w-9 h-9 rounded-xl bg-white text-red-600 flex items-center justify-center font-bold shadow-2xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Age</span>
                    <span className="block text-xs font-bold text-slate-800">
                      {donor.age} years old
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Tabbed Forms */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] border border-slate-200/80 overflow-hidden">
          {/* Tabs Bar */}
          <div className="flex flex-wrap border-b border-slate-100 bg-slate-50/80 p-2.5 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "general"
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("address")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "address"
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Address Details</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Account Security</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            
            {/* Personal Details Tab */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-850 tracking-tight">Personal Information</h3>
                    <p className="text-xs text-slate-400 font-medium">Update your profile details and vital stats</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-extrabold transition-all outline-none ${
                          isEditing
                            ? "bg-slate-50/60 hover:bg-white border-slate-200/90 text-slate-850 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                            : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                        }`}
                        placeholder="Enter full name"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-extrabold transition-all outline-none ${
                          isEditing
                            ? "bg-slate-50/60 hover:bg-white border-slate-200/90 text-slate-850 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                            : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                        }`}
                        placeholder="Phone number"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Age</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-extrabold transition-all outline-none ${
                          isEditing
                            ? "bg-slate-50/60 hover:bg-white border-slate-200/90 text-slate-850 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                            : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                        }`}
                        placeholder="Enter age"
                      />
                    </div>
                    {errors.age && (
                      <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.age}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Gender</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-extrabold transition-all outline-none cursor-pointer ${
                          isEditing
                            ? "bg-slate-50/60 hover:bg-white border-slate-200/90 text-slate-850 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                            : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                        }`}
                      >
                        <option value="">Select Gender</option>
                        {GENDER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.gender && (
                      <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.gender}
                      </p>
                    )}
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Weight (kg)</label>
                    <div className="relative">
                      <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        disabled={!isEditing}
                        min="45"
                        max="200"
                        step="0.1"
                        className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-extrabold transition-all outline-none ${
                          isEditing
                            ? "bg-slate-50/60 hover:bg-white border-slate-200/90 text-slate-850 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                            : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                        }`}
                        placeholder="Weight in kg"
                      />
                    </div>
                    {errors.weight && (
                      <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.weight}
                      </p>
                    )}
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Blood Group</label>
                    <div className="relative">
                      <Droplet className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-extrabold transition-all outline-none cursor-pointer ${
                          isEditing
                            ? "bg-slate-50/60 hover:bg-white border-slate-200/90 text-slate-850 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                            : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                        }`}
                      >
                        <option value="">Select Blood Group</option>
                        {BLOOD_GROUPS.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.bloodGroup && (
                      <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.bloodGroup}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Address Details Tab */}
            {activeTab === "address" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-850 tracking-tight">Address Details</h3>
                    <p className="text-xs text-slate-400 font-medium">Your primary residential address</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {["street", "city", "state", "pincode"].map((field) => (
                    <div key={field} className={field === "street" ? "md:col-span-2" : ""}>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 capitalize">
                        {field === "pincode" ? "PIN Code" : field}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input
                          type="text"
                          name={`address.${field}`}
                          value={formData.address?.[field] || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-extrabold transition-all outline-none ${
                            isEditing
                              ? "bg-slate-50/60 hover:bg-white border-slate-200/90 text-slate-850 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                              : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                          }`}
                          placeholder={`Enter ${field === "pincode" ? "PIN code" : field}`}
                        />
                      </div>
                      {errors[`address.${field}`] && (
                        <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors[`address.${field}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-850 tracking-tight">Account Security</h3>
                    <p className="text-xs text-slate-400 font-medium">Manage email & login password</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Registered Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      <input
                        type="email"
                        value={donor.email}
                        disabled
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200/50 bg-slate-50 text-slate-400 font-extrabold text-sm cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1">Contact admin to request an email address update</p>
                  </div>

                  {isEditing && (
                    <div className="pt-4 border-t border-slate-100">
                      <div className="max-w-md">
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">New Password (optional)</label>
                        <div className="relative">
                          <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white text-slate-850 font-extrabold text-sm focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
                            placeholder="Enter new password"
                          />
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 font-medium mt-1">Leave blank if you don't wish to change your password</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default DonorProfile;