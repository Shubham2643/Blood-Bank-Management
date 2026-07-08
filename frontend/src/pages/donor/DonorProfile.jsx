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
    <div className="space-y-6 pb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster />
      {/* Premium Profile Hero Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-red-600 to-rose-600 rounded-3xl shadow-xl shadow-red-950/20 border border-rose-700/30 overflow-hidden hover:shadow-2xl hover:shadow-red-950/30 transition-all duration-300 relative px-6 py-8 sm:px-8 sm:py-10 flex flex-col md:flex-row gap-6 justify-between items-center md:items-end">
        {/* Decorative Circle Overlays */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
        <div className="absolute right-10 top-2 w-44 h-44 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute left-1/3 -bottom-10 w-36 h-36 bg-rose-300/20 rounded-full blur-2xl" />
        <div className="absolute right-1/4 top-4 w-28 h-28 bg-red-400/20 rounded-full blur-xl animate-pulse" />

        <div className="relative flex flex-col sm:flex-row gap-5 items-center sm:items-end text-center sm:text-left z-10">
          {/* Avatar with Double Glowing Rings */}
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-white/20 rounded-full blur opacity-45 group-hover:opacity-75 transition duration-300" />
            <div className="relative w-32 h-32 rounded-full bg-white flex items-center justify-center text-red-600 font-bold text-6xl shadow-2xl border-4 border-white/80 ring-4 ring-white/10 transition-transform duration-500 group-hover:scale-105">
              {(donor.fullName || "D").charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Title, Badges & Copy ID */}
          <div className="space-y-3 mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white drop-shadow-sm">
                {donor.fullName || "Donor Profile"}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider bg-white/100 text-green-900 border border-white/30 shadow-sm backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-green-900 animate-pulse" />
                Active Donor
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5 items-center justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-sm text-xs font-semibold">
                <Droplet size={12} className="fill-white stroke-white animate-pulse" />
                Blood Group: {donor.bloodGroup || "—"}
              </span>
              
              {donor.donorId && (
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-xs font-mono transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <span>ID: {donor.donorId}</span>
                  {copied ? (
                    <Check size={12} className="text-white" />
                  ) : (
                    <Copy size={11} className="text-white/70 group-hover:text-white transition-colors" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative flex gap-3 mb-2 z-10">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-5.5 py-3 rounded-xl transition-all duration-200 border border-white/25 shadow-sm font-semibold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || hasErrors}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 disabled:bg-white/50 disabled:text-red-300 disabled:cursor-not-allowed text-red-600 px-5.5 py-3 rounded-xl transition-all duration-200 shadow-md font-semibold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-red-600 px-5.5 py-3 rounded-xl transition-all duration-250 shadow-lg shadow-black/10 hover:shadow-xl font-bold font-mono text-sm uppercase tracking-wider hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              <Edit3 size={14} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Grid Dashboard Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Status & Contact Widgets */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Status Widget */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/40 rounded-full blur-2xl -z-10" />
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2.5 pb-3 border-b border-slate-50">
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <Award className="w-4 h-4" />
              </div>
              Donor Status
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50/50">
                <span className="text-sm font-medium text-slate-500">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  donor.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                    : donor.status === "pending"
                    ? "bg-amber-50 text-amber-700 border-amber-200/50"
                    : "bg-rose-50 text-rose-700 border-rose-200/50"
                }`}>
                  {donor.status?.charAt(0).toUpperCase() + donor.status?.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50/50">
                <span className="text-sm font-medium text-slate-500">Blood Group</span>
                <span className="text-sm font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-100">
                  {donor.bloodGroup || "—"}
                </span>
              </div>

              {donor.lastDonation && (
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm font-medium text-slate-500">Last Donation</span>
                  <span className="text-sm font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                    {new Date(donor.lastDonation).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Achievement Bar */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span className="capitalize">{currentTier} Tier</span>
                <span>{totalDonations} / {targetDonations} Donations</span>
              </div>
              <div className="w-full bg-slate-100/85 rounded-full h-2.5 overflow-hidden border border-slate-200/30 p-0.5">
                <div 
                  className="bg-gradient-to-r from-red-500 to-rose-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.35)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                {totalDonations >= 10 
                  ? "Max level unlocked! You are a hero! 🌟" 
                  : `${targetDonations - totalDonations} more donation${targetDonations - totalDonations !== 1 ? 's' : ''} to unlock ${nextLevel}.`}
              </p>
            </div>
          </div>

          {/* Quick Info Contact Widget */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-rose-50/40 rounded-full blur-2xl -z-10" />
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2.5 pb-3 border-b border-slate-50">
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <Phone className="w-4 h-4" />
              </div>
              Quick Contact
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/40 border border-slate-100 hover:border-red-100 hover:bg-red-50/10 transition-all duration-200">
                <div className="p-2 bg-white rounded-lg text-red-500 border border-slate-100 shadow-sm">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-600 break-all">{donor.email}</span>
              </div>

              {donor.phone && (
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/40 border border-slate-100 hover:border-red-100 hover:bg-red-50/10 transition-all duration-200">
                  <div className="p-2 bg-white rounded-lg text-red-500 border border-slate-100 shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600">{donor.phone}</span>
                </div>
              )}

              {donor.age && (
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/40 border border-slate-100 hover:border-red-100 hover:bg-red-50/10 transition-all duration-200">
                  <div className="p-2 bg-white rounded-lg text-red-500 border border-slate-100 shadow-sm">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600">{donor.age} years old</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Elegant Forms Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            {/* Tab Navigation */}
            <div className="flex flex-wrap border-b border-slate-100 bg-slate-50/50 p-2 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "general"
                    ? "bg-white text-red-600 shadow-sm border border-slate-100"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                }`}
              >
                <User size={14} />
                Personal Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("address")}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "address"
                    ? "bg-white text-red-600 shadow-sm border border-slate-100"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                }`}
              >
                <MapPin size={14} />
                Address Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "security"
                    ? "bg-white text-red-600 shadow-sm border border-slate-100"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                }`}
              >
                <Shield size={14} />
                Account Security
              </button>
            </div>

            {/* Tab Panels */}
            <div className="p-6 sm:p-8">
              
              {/* Personal Details Panel */}
              {activeTab === "general" && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                      <User className="w-5 h-5" />
                    </div>
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                          isEditing
                            ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                            : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                        } ${errors.fullName ? "border-red-500 focus:ring-red-500/10" : ""}`}
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                          <AlertCircle size={14} className="text-red-500" /> {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                          isEditing
                            ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                            : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                        } ${errors.phone ? "border-red-500 focus:ring-red-500/10" : ""}`}
                        placeholder="Phone number"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                          <AlertCircle size={14} className="text-red-500" /> {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                          isEditing
                            ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                            : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                        } ${errors.age ? "border-red-500 focus:ring-red-500/10" : ""}`}
                        placeholder="Enter your age"
                      />
                      {errors.age && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                          <AlertCircle size={14} className="text-red-500" /> {errors.age}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_1rem_center] bg-no-repeat ${
                          isEditing
                            ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                            : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                        } ${errors.gender ? "border-red-500 focus:ring-red-500/10" : ""}`}
                      >
                        <option value="">Select Gender</option>
                        {GENDER_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.gender && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                          <AlertCircle size={14} className="text-red-500" /> {errors.gender}
                        </p>
                      )}
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        disabled={!isEditing}
                        min="45"
                        max="200"
                        step="0.1"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                          isEditing
                            ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                            : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                        } ${errors.weight ? "border-red-500 focus:ring-red-500/10" : ""}`}
                        placeholder="Weight in kg"
                      />
                      {errors.weight && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                          <AlertCircle size={14} className="text-red-500" /> {errors.weight}
                        </p>
                      )}
                    </div>

                    {/* Blood Group */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_1rem_center] bg-no-repeat ${
                          isEditing
                            ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                            : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                        } ${errors.bloodGroup ? "border-red-500 focus:ring-red-500/10" : ""}`}
                      >
                        <option value="">Select Blood Group</option>
                        {BLOOD_GROUPS.map(group => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                      {errors.bloodGroup && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                          <AlertCircle size={14} className="text-red-500" /> {errors.bloodGroup}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Address Details Panel */}
              {activeTab === "address" && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    Address Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {["street", "city", "state", "pincode"].map((field) => (
                      <div key={field} className={field === "street" ? "md:col-span-2" : ""}>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 capitalize">
                          {field === "pincode" ? "PIN Code" : field}
                        </label>
                        <input
                          type="text"
                          name={`address.${field}`}
                          value={formData.address?.[field] || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                            isEditing
                              ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                              : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                          } ${errors[`address.${field}`] ? "border-red-500 focus:ring-red-500/10" : ""}`}
                          placeholder={`Enter your ${field === "pincode" ? "PIN code" : field}`}
                        />
                        {errors[`address.${field}`] && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                            <AlertCircle size={14} className="text-red-500" /> {errors[`address.${field}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Security Panel */}
              {activeTab === "security" && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                      <Shield className="w-5 h-5" />
                    </div>
                    Account Security
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                      <input
                        type="email"
                        value={donor.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-slate-200/40 bg-slate-50 text-slate-500 font-semibold text-sm cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-400 mt-2 font-medium">Email address cannot be changed</p>
                    </div>

                    {/* Password */}
                    {isEditing && (
                      <div className="pt-6 border-t border-slate-100 space-y-4">
                        <div className="max-w-md">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password (optional)</label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                              isEditing
                                ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                                : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                            } ${errors.password ? "border-red-500 focus:ring-red-500/10" : ""}`}
                            placeholder="Enter new password"
                          />
                          {errors.password && (
                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                              <AlertCircle size={14} className="text-red-500" /> {errors.password}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-2 font-medium">
                            Leave blank to keep your current password
                          </p>
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
    </div>
  );
};

const ScaleIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1" />
    <path d="M18 8H6" />
    <path d="M12 3v13" />
    <path d="M19 16c.4-1.2 1.4-2 2.6-2 .7 0 1.4.3 1.9.8A3 3 0 0 1 20 20c-1 0-1.8-.7-2.1-1.6" />
    <path d="M2.6 14C3.8 14 4.8 14.8 5 16c.3 1 .1 1.9-.5 2.5A3 3 0 0 1 1 18c0-1.2.7-2 1.9-2.2" />
  </svg>
);

export default DonorProfile;