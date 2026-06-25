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
      {/* Premium Profile Hero Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-red-600 to-rose-600 rounded-3xl shadow-xl shadow-red-950/20 border border-rose-700/30 overflow-hidden hover:shadow-2xl hover:shadow-red-950/30 transition-all duration-300 relative px-6 py-8 sm:px-8 sm:py-10 flex flex-col md:flex-row gap-6 justify-between items-center md:items-end mb-8">
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
              {isHospital ? <Building className="w-12 h-12" /> : <FlaskConical className="w-12 h-12" />}
            </div>
          </div>

          {/* Title, Badges */}
          <div className="space-y-3 mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5.5 justify-center sm:justify-start">
              <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white drop-shadow-sm">
                {Facility.name || `${labelType} Profile`}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider bg-white text-rose-900 border border-white/30 shadow-sm backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                {isHospital ? "Hospital" : "Laboratory"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5 items-center justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-sm text-xs font-semibold">
                REG: {Facility.registrationNumber || "—"}
              </span>
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
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-red-600 px-5.5 py-3 rounded-xl transition-all duration-255 shadow-lg shadow-black/10 hover:shadow-xl font-bold font-mono text-sm uppercase tracking-wider hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              <Edit3 size={14} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Verification Status */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/40 rounded-full blur-2xl -z-10" />
              <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2.5 pb-3 border-b border-slate-50">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <Shield className="w-4 h-4" />
                </div>
                Verification Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50/50">
                  <span className="text-sm font-medium text-slate-500">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      Facility.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                        : Facility.status === "pending"
                        ? "bg-amber-50 text-amber-700 border-amber-200/50"
                        : "bg-rose-50 text-rose-700 border-rose-200/50"
                    }`}
                  >
                    {Facility.status?.charAt(0).toUpperCase() + Facility.status?.slice(1)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-50/50">
                  <span className="text-sm font-medium text-slate-500">Registration</span>
                  <span className="text-sm font-mono font-bold text-slate-700">
                    {Facility.registrationNumber || "—"}
                  </span>
                </div>

                {Facility.approvedAt && (
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm font-medium text-slate-500">Approved On</span>
                    <span className="text-sm font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                      {new Date(Facility.approvedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Contact Info */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-rose-50/40 rounded-full blur-2xl -z-10" />
              <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2.5 pb-3 border-b border-slate-50">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <User className="w-4 h-4" />
                </div>
                Quick Contact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/40 border border-slate-100 hover:border-red-100 hover:bg-red-50/10 transition-all duration-200">
                  <div className="p-2 bg-white rounded-lg text-red-500 border border-slate-100 shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600 break-all">{Facility.email}</span>
                </div>
                {Facility.phone && (
                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/40 border border-slate-100 hover:border-red-100 hover:bg-red-50/10 transition-all duration-200">
                    <div className="p-2 bg-white rounded-lg text-red-500 border border-slate-100 shadow-sm">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{Facility.phone}</span>
                  </div>
                )}
                {Facility.emergencyContact && (
                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/40 border border-slate-100 hover:border-red-100 hover:bg-red-50/10 transition-all duration-200">
                    <div className="p-2 bg-white rounded-lg text-red-500 border border-slate-100 shadow-sm">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">
                      Emergency: {Facility.emergencyContact}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Form Fields Content */}
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
                  <Building size={14} />
                  General Details
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
                  onClick={() => setActiveTab("hours")}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === "hours"
                      ? "bg-white text-red-600 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                  }`}
                >
                  <Clock size={14} />
                  Operating Hours
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
                {/* General Tab */}
                {activeTab === "general" && (
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="p-2 bg-red-50 rounded-lg text-red-600">
                        <Building className="w-5 h-5" />
                      </div>
                      General Profile Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          {labelType} Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                            isEditing
                              ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                              : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                          }`}
                          placeholder={`Enter ${labelType.toLowerCase()} name`}
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Facility Category
                        </label>
                        <input
                          type="text"
                          name="FacilityCategory"
                          value={formData.FacilityCategory}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                            isEditing
                              ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                              : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                          }`}
                          placeholder="e.g. General Hospital, Blood Lab"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Phone Number
                        </label>
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
                          } ${errors.phone ? "border-red-500" : ""}`}
                          placeholder="10-digit phone number"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                            <AlertCircle size={14} className="text-red-500" />
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      {/* Emergency Contact */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Emergency Contact
                        </label>
                        <input
                          type="tel"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                            isEditing
                              ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                              : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                          } ${errors.emergencyContact ? "border-red-500" : ""}`}
                          placeholder="Emergency contact number"
                        />
                        {errors.emergencyContact && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                            <AlertCircle size={14} className="text-red-500" />
                            {errors.emergencyContact}
                          </p>
                        )}
                      </div>

                      {/* Contact Person */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Primary Contact Person
                        </label>
                        <input
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                            isEditing
                              ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                              : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
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
                            } ${errors[`address.${field}`] ? "border-red-500" : ""}`}
                            placeholder={`Enter ${field === "pincode" ? "PIN code" : field}`}
                          />
                          {errors[`address.${field}`] && (
                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                              <AlertCircle size={14} className="text-red-500" />
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
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="p-2 bg-red-50 rounded-lg text-red-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      Operating Hours Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Open time */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          name="operatingHours.open"
                          value={formData.operatingHours.open}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                            isEditing
                              ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                              : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                          }`}
                        />
                      </div>

                      {/* Close time */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          name="operatingHours.close"
                          value={formData.operatingHours.close}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold ${
                            isEditing
                              ? "border-slate-200 bg-white text-slate-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                              : "bg-slate-50 text-slate-500 border-slate-200/60 cursor-not-allowed"
                          }`}
                        />
                      </div>

                      {/* Working Days Selectors */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
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
                                className={`px-4 py-2 rounded-2xl text-xs font-black border transition-all duration-200 ${
                                  isActive
                                    ? "bg-red-50 border-red-200 text-red-600 shadow-sm"
                                    : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                } ${isEditing ? "cursor-pointer hover:scale-[1.03]" : "cursor-default opacity-85"}`}
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
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="p-2 bg-red-50 rounded-lg text-red-600">
                        <Shield className="w-5 h-5" />
                      </div>
                      Account Security
                    </h3>

                    {/* Email address display (read-only) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Account Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={Facility.email}
                          disabled
                          className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-slate-50 text-slate-500 font-semibold text-sm cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2 font-medium">
                        Email cannot be changed online
                      </p>
                    </div>

                    {/* Password change inputs */}
                    {isEditing && (
                      <div className="pt-6 border-t border-slate-100">
                        <div className="max-w-md">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            New Password (optional)
                          </label>
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
                            placeholder="Enter new password (min. 6 characters)"
                          />
                          {errors.password && (
                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                              <AlertCircle size={14} className="text-red-500" />
                              {errors.password}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-2 font-medium">
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