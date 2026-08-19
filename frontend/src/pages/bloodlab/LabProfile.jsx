import { useEffect, useState, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  Loader2,
  Save,
  Edit3,
  X,
  MapPin,
  Mail,
  FlaskConical,
  Phone,
  User,
  Shield,
  Heart,
  Droplet,
  Clock,
  Building,
  AlertCircle,
} from "lucide-react";

import { facilityApi } from "../../services/api.js";

const defaultOperatingHours = {
  open: "09:00",
  close: "18:00",
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
};

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const LabProfile = () => {
  const [Facility, setFacility] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    emergencyContact: "",
    FacilityCategory: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    contactPerson: "",
    operatingHours: defaultOperatingHours,
    password: "",
  });
  const [activeTab, setActiveTab] = useState("general");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const initializeOperatingHours = (hoursData) => {
    if (hoursData && typeof hoursData === "object" && !Array.isArray(hoursData)) {
      return {
        open: hoursData.open || "09:00",
        close: hoursData.close || "18:00",
        workingDays: Array.isArray(hoursData.workingDays)
          ? hoursData.workingDays
          : ["Mon", "Tue", "Wed", "Thu", "Fri"],
      };
    }
    return defaultOperatingHours;
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    const path = name;

    switch (path) {
      case "phone":
      case "emergencyContact":
        if (value && !/^[6-9][0-9]{9}$/.test(value)) {
          newErrors[path] = "Must be a valid 10-digit Indian phone number starting with 6-9";
        } else {
          delete newErrors[path];
        }
        break;
      case "address.pincode":
        if (value && !/^[1-9][0-9]{5}$/.test(value)) {
          newErrors["address.pincode"] = "Must be a valid 6-digit pincode starting with 1-9";
        } else {
          delete newErrors["address.pincode"];
        }
        break;
      case "password":
        if (value && value.length < 6) {
          newErrors["password"] = "Password must be at least 6 characters";
        } else {
          delete newErrors["password"];
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authorization token found.");
      }

      const { data } = await facilityApi.getProfile();
      const profile = data.data || data.facility || data.Facility;

      if (data.success && profile) {
        setFacility(profile);
        setFormData({
          name: profile.name || "",
          phone: profile.phone || "",
          emergencyContact: profile.emergencyContact || "",
          FacilityCategory: profile.FacilityCategory || "",
          address: {
            street: profile.address?.street || "",
            city: profile.address?.city || "",
            state: profile.address?.state || "",
            pincode: profile.address?.pincode || "",
          },
          contactPerson: profile.contactPerson || "",
          operatingHours: initializeOperatingHours(profile.operatingHours),
          password: "",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("❌ Fetch Profile Error:", error);
      let message;

      if (
        error.message.includes("No authorization token found") ||
        error.response?.status === 401
      ) {
        message = "Session expired or unauthorized. Please log in.";
        localStorage.removeItem("token");
        setFacility(null);
        toast.error(message);
        return;
      }

      message = error.response?.data?.message || "Failed to load profile";
      toast.error(message);
      setFacility(null);
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
    } else if (name.startsWith("operatingHours.")) {
      const key = name.split(".")[1];
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          operatingHours: { ...prev.operatingHours, [key]: value },
        };
        return updatedData;
      });
    } else {
      setFormData((prev) => {
        const updatedData = { ...prev, [name]: value };
        validateField(name, value);
        return updatedData;
      });
    }
  };

  const toggleWorkingDay = (day) => {
    if (!isEditing) return;
    setFormData((prev) => {
      const workingDays = [...prev.operatingHours.workingDays];
      const index = workingDays.indexOf(day);
      if (index > -1) {
        workingDays.splice(index, 1);
      } else {
        workingDays.push(day);
      }
      return {
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          workingDays,
        },
      };
    });
  };

  const handleSave = async () => {
    // Validate everything first
    const hasErrors = Object.values(errors).filter((e) => e).length > 0;
    if (hasErrors) {
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
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        FacilityCategory: formData.FacilityCategory.trim(),
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          pincode: formData.address.pincode.trim(),
        },
        contactPerson: formData.contactPerson.trim(),
        operatingHours: {
          open: formData.operatingHours.open,
          close: formData.operatingHours.close,
          workingDays: formData.operatingHours.workingDays,
        },
      };

      if (formData.password && formData.password.length >= 6) {
        payload.password = formData.password;
      }

      const { data } = await facilityApi.updateProfile(payload);

      if (data.success) {
        toast.success("Profile updated successfully! 🎉");
        const profile = data.data || data.facility || data.Facility;
        setFacility(profile);
        setFormData((prev) => ({
          ...prev,
          password: "",
        }));
        setIsEditing(false);
        setErrors({});
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("❌ Update Profile Error:", error);
      let message = error.response?.data?.message || "Update failed";
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
    if (Facility) {
      setFormData({
        name: Facility.name || "",
        phone: Facility.phone || "",
        emergencyContact: Facility.emergencyContact || "",
        FacilityCategory: Facility.FacilityCategory || "",
        address: {
          street: Facility.address?.street || "",
          city: Facility.address?.city || "",
          state: Facility.address?.state || "",
          pincode: Facility.address?.pincode || "",
        },
        contactPerson: Facility.contactPerson || "",
        operatingHours: initializeOperatingHours(Facility.operatingHours),
        password: "",
      });
    }
  };

  if (loading && !Facility) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Droplet className="w-12 h-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Profile</h2>
          <p className="text-gray-500">Preparing your facility information...</p>
        </div>
      </div>
    );
  }

  if (!Facility) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center bg-white rounded-2xl shadow-lg border border-red-100 p-8">
          <Droplet className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile Error</h3>
          <p className="text-gray-600 mb-4">
            Could not load profile. Please ensure you are authenticated.
          </p>
          <button
            onClick={fetchProfile}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const isHospital = Facility.facilityType === "hospital";
  const labelType = isHospital ? "Hospital" : "Laboratory";
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster />
      {/* Signature Crimson-Rose Profile Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-red-900 p-6 sm:p-8 text-white shadow-xl shadow-red-900/20 border border-red-500/30 flex flex-col md:flex-row gap-6 justify-between items-center md:items-end mb-8">
        {/* Geometric Vector Rings Background Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="90" cy="10" r="30" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="10" cy="90" r="25" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-center sm:items-end text-center sm:text-left">
          {/* Avatar Badge with Glass Ring */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white text-red-600 font-black flex items-center justify-center shadow-2xl ring-4 ring-white/20 border-4 border-white flex-shrink-0">
            {isHospital ? <Building className="w-10 h-10 text-red-600" /> : <FlaskConical className="w-10 h-10 text-red-600" />}
          </div>

          {/* Title & Registration Chips */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white">
                {Facility.name || `${labelType} Profile`}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {isHospital ? "Hospital" : "Laboratory"}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-red-100 border border-white/15 text-xs font-mono font-bold">
                REG: {Facility.registrationNumber || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex gap-3 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white rounded-2xl font-black text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 shadow-md flex-shrink-0 active:scale-95"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || hasErrors}
                className="px-6 py-3.5 bg-white text-red-600 hover:bg-red-50 disabled:opacity-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer hover:scale-105 shadow-xl flex-shrink-0 active:scale-95 border-2 border-white/40"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3.5 bg-white text-red-600 hover:bg-red-50 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer hover:scale-105 shadow-xl flex-shrink-0 active:scale-95 border-2 border-white/40"
            >
              <Edit3 size={16} /> <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Verification Status */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-100/80 border border-slate-100/90 p-6 sm:p-7 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-rose-100/40 to-red-100/10 rounded-full blur-3xl pointer-events-none -z-10" />
              <h3 className="text-base font-black text-slate-850 mb-5 flex items-center gap-3 pb-3.5 border-b border-slate-100 uppercase tracking-wide">
                <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl text-white flex items-center justify-center shadow-md shadow-red-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <span>Verification Status</span>
              </h3>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center py-2 px-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs flex items-center gap-1.5 ${
                      Facility.status === "approved"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200/90"
                        : Facility.status === "pending"
                        ? "bg-amber-50 text-amber-900 border-amber-200/90"
                        : "bg-rose-50 text-rose-900 border-rose-200/90"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      Facility.status === "approved" ? "bg-emerald-500 animate-pulse" :
                      Facility.status === "pending" ? "bg-amber-500" : "bg-rose-500"
                    }`} />
                    <span>{Facility.status?.charAt(0).toUpperCase() + Facility.status?.slice(1)}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Registration</span>
                  <span className="text-xs font-mono font-black text-slate-850 bg-white px-2.5 py-1 rounded-xl border border-slate-200/70 shadow-2xs">
                    {Facility.registrationNumber || "—"}
                  </span>
                </div>

                {Facility.approvedAt && (
                  <div className="flex justify-between items-center py-2 px-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Approved On</span>
                    <span className="text-xs font-black text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200/70 shadow-2xs">
                      {new Date(Facility.approvedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Contact Info */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-100/80 border border-slate-100/90 p-6 sm:p-7 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1">
              <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-br from-rose-100/40 to-red-100/10 rounded-full blur-3xl pointer-events-none -z-10" />
              <h3 className="text-base font-black text-slate-850 mb-5 flex items-center gap-3 pb-3.5 border-b border-slate-100 uppercase tracking-wide">
                <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl text-white flex items-center justify-center shadow-md shadow-red-500/20">
                  <User className="w-5 h-5" />
                </div>
                <span>Quick Contact</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:border-red-200 hover:bg-white transition-all shadow-2xs">
                  <div className="p-2 bg-white rounded-xl text-red-600 border border-slate-200/60 shadow-2xs shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-850 break-all">{Facility.email}</span>
                </div>
                {Facility.phone && (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:border-red-200 hover:bg-white transition-all shadow-2xs">
                    <div className="p-2 bg-white rounded-xl text-red-600 border border-slate-200/60 shadow-2xs shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-slate-850">{Facility.phone}</span>
                  </div>
                )}
                {Facility.emergencyContact && (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/60 hover:bg-rose-50 transition-all shadow-2xs">
                    <div className="p-2 bg-white rounded-xl text-rose-600 border border-rose-200/60 shadow-2xs shrink-0">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-rose-900">
                      Emergency: {Facility.emergencyContact}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Form Fields Content */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-100/80 border border-slate-100/90 overflow-hidden hover:shadow-2xl transition-all duration-300">
              {/* Tab Navigation Bar */}
              <div className="flex flex-wrap border-b border-slate-100 bg-slate-50/70 p-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("general")}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === "general"
                      ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/25 border-red-500 scale-105"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <Building size={15} />
                  <span>General Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("address")}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === "address"
                      ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/25 border-red-500 scale-105"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <MapPin size={15} />
                  <span>Address Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("hours")}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === "hours"
                      ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/25 border-red-500 scale-105"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <Clock size={15} />
                  <span>Operating Hours</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === "security"
                      ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/25 border-red-500 scale-105"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <Shield size={15} />
                  <span>Account Security</span>
                </button>
              </div>

              {/* Tab Panels */}
              <div className="p-6 sm:p-8">
                {/* General Tab */}
                {activeTab === "general" && (
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-lg font-black text-slate-850 flex items-center gap-3 pb-3.5 border-b border-slate-100 uppercase tracking-wide">
                      <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl text-white flex items-center justify-center shadow-md shadow-red-500/20">
                        <Building className="w-5 h-5" />
                      </div>
                      <span>General Profile Details</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                          {labelType} Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4.5 py-3.5 rounded-2xl transition-all duration-200 text-sm font-extrabold ${
                            isEditing
                              ? "border-2 border-red-500/40 bg-white text-slate-900 focus:ring-4 focus:ring-red-500/10 focus:outline-none shadow-md"
                              : "bg-slate-50/90 text-slate-800 border border-slate-200/80 cursor-not-allowed shadow-inner"
                          }`}
                          placeholder={`Enter ${labelType.toLowerCase()} name`}
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                          Facility Category
                        </label>
                        <input
                          type="text"
                          name="FacilityCategory"
                          value={formData.FacilityCategory}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4.5 py-3.5 rounded-2xl transition-all duration-200 text-sm font-extrabold ${
                            isEditing
                              ? "border-2 border-red-500/40 bg-white text-slate-900 focus:ring-4 focus:ring-red-500/10 focus:outline-none shadow-md"
                              : "bg-slate-50/90 text-slate-800 border border-slate-200/80 cursor-not-allowed shadow-inner"
                          }`}
                          placeholder="e.g. General Hospital, Blood Lab"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4.5 py-3.5 rounded-2xl transition-all duration-200 text-sm font-extrabold ${
                            isEditing
                              ? "border-2 border-red-500/40 bg-white text-slate-900 focus:ring-4 focus:ring-red-500/10 focus:outline-none shadow-md"
                              : "bg-slate-50/90 text-slate-800 border border-slate-200/80 cursor-not-allowed shadow-inner"
                          } ${errors.phone ? "border-rose-500" : ""}`}
                          placeholder="10-digit phone number"
                        />
                        {errors.phone && (
                          <p className="text-rose-600 text-xs mt-2 flex items-center gap-1.5 font-bold">
                            <AlertCircle size={14} className="text-rose-600" />
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      {/* Emergency Contact */}
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                          Emergency Contact
                        </label>
                        <input
                          type="tel"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4.5 py-3.5 rounded-2xl transition-all duration-200 text-sm font-extrabold ${
                            isEditing
                              ? "border-2 border-red-500/40 bg-white text-slate-900 focus:ring-4 focus:ring-red-500/10 focus:outline-none shadow-md"
                              : "bg-slate-50/90 text-slate-800 border border-slate-200/80 cursor-not-allowed shadow-inner"
                          } ${errors.emergencyContact ? "border-rose-500" : ""}`}
                          placeholder="Emergency contact number"
                        />
                        {errors.emergencyContact && (
                          <p className="text-rose-600 text-xs mt-2 flex items-center gap-1.5 font-bold">
                            <AlertCircle size={14} className="text-rose-600" />
                            {errors.emergencyContact}
                          </p>
                        )}
                      </div>

                      {/* Contact Person */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                          Primary Contact Person
                        </label>
                        <input
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4.5 py-3.5 rounded-2xl transition-all duration-200 text-sm font-extrabold ${
                            isEditing
                              ? "border-2 border-red-500/40 bg-white text-slate-900 focus:ring-4 focus:ring-red-500/10 focus:outline-none shadow-md"
                              : "bg-slate-50/90 text-slate-800 border border-slate-200/80 cursor-not-allowed shadow-inner"
                          }`}
                          placeholder="Name of contact representative"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Tab */}
                {activeTab === "address" && (
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-lg font-black text-slate-850 flex items-center gap-3 pb-3.5 border-b border-slate-100 uppercase tracking-wide">
                      <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl text-white flex items-center justify-center shadow-md shadow-red-500/20">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span>Address Details</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {["street", "city", "state", "pincode"].map((field) => (
                        <div key={field} className={field === "street" ? "md:col-span-2" : ""}>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 capitalize">
                            {field === "pincode" ? "PIN Code" : field}
                          </label>
                          <input
                            type="text"
                            name={`address.${field}`}
                            value={formData.address?.[field] || ""}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`w-full px-4.5 py-3.5 rounded-2xl transition-all duration-200 text-sm font-extrabold ${
                              isEditing
                                ? "border-2 border-red-500/40 bg-white text-slate-900 focus:ring-4 focus:ring-red-500/10 focus:outline-none shadow-md"
                                : "bg-slate-50/90 text-slate-800 border border-slate-200/80 cursor-not-allowed shadow-inner"
                            } ${errors[`address.${field}`] ? "border-rose-500" : ""}`}
                            placeholder={`Enter ${field === "pincode" ? "PIN code" : field}`}
                          />
                          {errors[`address.${field}`] && (
                            <p className="text-rose-600 text-xs mt-2 flex items-center gap-1.5 font-bold">
                              <AlertCircle size={14} className="text-rose-600" />
                              {errors[`address.${field}`]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operating Hours Tab */}
                {activeTab === "hours" && (
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-lg font-black text-slate-850 flex items-center gap-3 pb-3.5 border-b border-slate-100 uppercase tracking-wide">
                      <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl text-white flex items-center justify-center shadow-md shadow-red-500/20">
                        <Clock className="w-5 h-5" />
                      </div>
                      <span>Operating Hours Configuration</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Open time */}
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          name="operatingHours.open"
                          value={formData.operatingHours.open}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4.5 py-3.5 rounded-2xl transition-all duration-200 text-sm font-extrabold ${
                            isEditing
                              ? "border-2 border-red-500/40 bg-white text-slate-900 focus:ring-4 focus:ring-red-500/10 focus:outline-none shadow-md"
                              : "bg-slate-50/90 text-slate-800 border border-slate-200/80 cursor-not-allowed shadow-inner"
                          }`}
                        />
                      </div>

                      {/* Close time */}
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          name="operatingHours.close"
                          value={formData.operatingHours.close}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4.5 py-3.5 rounded-2xl transition-all duration-200 text-sm font-extrabold ${
                            isEditing
                              ? "border-2 border-red-500/40 bg-white text-slate-900 focus:ring-4 focus:ring-red-500/10 focus:outline-none shadow-md"
                              : "bg-slate-50/90 text-slate-800 border border-slate-200/80 cursor-not-allowed shadow-inner"
                          }`}
                        />
                      </div>

                      {/* Working Days Selectors */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5">
                          Active Working Days
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {DAYS_OF_WEEK.map((day) => {
                            const isActive = formData.operatingHours.workingDays.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleWorkingDay(day)}
                                disabled={!isEditing}
                                className={`px-4.5 py-2.5 rounded-2xl text-xs font-black border transition-all duration-200 uppercase tracking-wider ${
                                  isActive
                                    ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md shadow-red-600/25 border-red-500 scale-105"
                                    : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                                } ${isEditing ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default opacity-85"}`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-lg font-black text-slate-850 flex items-center gap-3 pb-3.5 border-b border-slate-100 uppercase tracking-wide">
                      <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl text-white flex items-center justify-center shadow-md shadow-red-500/20">
                        <Shield className="w-5 h-5" />
                      </div>
                      <span>Account Security</span>
                    </h3>

                    {/* Email address display (read-only) */}
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                        Account Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={Facility.email}
                          disabled
                          className="w-full px-4.5 py-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/90 text-slate-800 font-extrabold text-sm cursor-not-allowed shadow-inner"
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2 font-extrabold">
                        Email cannot be changed online for security compliance
                      </p>
                    </div>

                    {/* Password change inputs */}
                    {isEditing && (
                      <div className="pt-6 border-t border-slate-100">
                        <div className="max-w-md">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                            New Password (optional)
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4.5 py-3.5 rounded-2xl transition-all duration-200 text-sm font-extrabold ${
                              isEditing
                                ? "border-2 border-red-500/40 bg-white text-slate-900 focus:ring-4 focus:ring-red-500/10 focus:outline-none shadow-md"
                                : "bg-slate-50/90 text-slate-800 border border-slate-200/80 cursor-not-allowed shadow-inner"
                            } ${errors.password ? "border-rose-500" : ""}`}
                            placeholder="Enter new password (min. 6 characters)"
                          />
                          {errors.password && (
                            <p className="text-rose-600 text-xs mt-2 flex items-center gap-1.5 font-bold">
                              <AlertCircle size={14} className="text-rose-600" />
                              {errors.password}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-2 font-semibold">
                            Leave empty if you don't wish to change the password
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default LabProfile;