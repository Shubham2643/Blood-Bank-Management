import {
  ArrowRight,
  Heart,
  Users,
  MapPin,
  Clock,
  Droplets,
  Shield,
  Zap,
  Search,
  Bell,
  Calendar,
  FileText,
  Award,
  CheckCircle,
  Target,
  Activity,
  RefreshCw,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  X,
  Play,
  Mail,
  Phone,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Loader2,
  Menu,
  UserPlus,
  Building2,
  FlaskConical,
  ChevronDown,
  Sparkles,
  Gift,
  Trophy,
  TrendingUp,
  HeartHandshake,
  Ambulance,
  Baby,
  Bone,
  Droplet,
  Navigation,
  Filter,
  Share2,
  Bookmark,
  PhoneCall,
  MessageCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import useCampRealtime from "../hooks/useCampRealtime.js";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api, { publicApi, authApi } from "../services/api.js";

// API service for fetching real data
const apiService = {
  async get(endpoint) {
    try {
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  },

  async post(endpoint, data) {
    try {
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  },

  async getStats() {
    try {
      const response = await publicApi.getStats();
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  },

  async getEmergencyNeeds() {
    try {
      const response = await publicApi.getEmergencyNeeds();
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  },

  async getUpcomingCamps() {
    try {
      const response = await publicApi.getUpcomingCamps();
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  },

  async getNearbyCamps(lat, lng, radius = 50) {
    try {
      const response = await publicApi.getNearbyCamps({ lat, lng, radius });
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  },

  async createEmergencyRequest(requestData) {
    return this.post("/emergency/requests", requestData);
  },

  async subscribeNewsletter(email) {
    try {
      const response = await publicApi.subscribeNewsletter(email);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      return false;
    }
  },

  async checkAuthStatus() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const response = await authApi.verify();
      return response.data;
    } catch (error) {
      console.error("Auth check error:", error);
      return null;
    }
  },

  async registerDonor(donorData) {
    return this.post("/auth/register/donor", donorData);
  },

  async registerHospital(hospitalData) {
    return this.post("/auth/register/hospital", hospitalData);
  },

  async registerBloodLab(labData) {
    return this.post("/auth/register/blood-lab", labData);
  },
};

// Quick action menu component
const QuickActionMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="absolute bottom-16 right-0 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
      <div className="p-2">
        <button
          onClick={() => handleNavigation("/register/donor")}
          className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-red-100 rounded-lg">
            <UserPlus className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Register as Donor</p>
            <p className="text-xs text-gray-500">Start saving lives today</p>
          </div>
        </button>

        <button
          onClick={() => handleNavigation("/register/facility")}
          className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Register Facility</p>
            <p className="text-xs text-gray-500">Hospital or Blood Lab</p>
          </div>
        </button>

        <button
          onClick={() => handleNavigation("/camps")}
          className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-green-100 rounded-lg">
            <Calendar className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Find Blood Camps</p>
            <p className="text-xs text-gray-500">Donate at nearby camps</p>
          </div>
        </button>

        <button
          onClick={() => handleNavigation("/blood-request")}
          className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Emergency Request</p>
            <p className="text-xs text-gray-500">Urgent blood needed</p>
          </div>
        </button>

        <div className="border-t border-gray-200 my-2"></div>

        <button
          onClick={() => handleNavigation("/about")}
          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-gray-100 rounded-lg">
            <Heart className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">About Us</p>
            <p className="text-xs text-gray-500">
              Learn more about our mission
            </p>
          </div>
        </button>

        <button
          onClick={() => handleNavigation("/contact")}
          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-gray-100 rounded-lg">
            <Mail className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Contact Support</p>
            <p className="text-xs text-gray-500">Get help and answers</p>
          </div>
        </button>
      </div>
    </div>
  );
};

// Emergency Request Modal
const EmergencyRequestModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    bloodType: "",
    units: "",
    hospital: "",
    location: "",
    contactName: "",
    contactPhone: "",
    urgency: "critical",
    additionalInfo: "",
  });
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadHospitals();
    }
  }, [isOpen]);

  const loadHospitals = async () => {
    const data = await apiService.get("/public/hospitals");
    if (data?.hospitals) {
      setHospitals(data.hospitals);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to make an emergency request");
        navigate("/login");
        return;
      }

      const response = await apiService.createEmergencyRequest(formData);
      if (response && response.success) {
        toast.success("Emergency request submitted successfully!");
        toast.success("Nearby donors and hospitals have been notified!");
        onClose();
        if (response.requestId) {
          navigate("/blood-request");
        }
      } else {
        toast.error(response?.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Submit request error:", error);
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: `${position.coords.latitude},${position.coords.longitude}`,
          });
          toast.success("Location shared successfully");
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          toast.error("Unable to get location. Please enter manually.");
        },
      );
    } else {
      toast.error("Geolocation not supported");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Emergency Blood Request
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Urgent blood needed - Immediate action required
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            <div
              className={`flex-1 text-center ${step >= 1 ? "text-red-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${step >= 1 ? "bg-red-600 text-white" : "bg-gray-200"}`}
              >
                1
              </div>
              <span className="text-sm">Patient Details</span>
            </div>
            <div
              className={`flex-1 text-center ${step >= 2 ? "text-red-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${step >= 2 ? "bg-red-600 text-white" : "bg-gray-200"}`}
              >
                2
              </div>
              <span className="text-sm">Blood Requirements</span>
            </div>
            <div
              className={`flex-1 text-center ${step >= 3 ? "text-red-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${step >= 3 ? "bg-red-600 text-white" : "bg-gray-200"}`}
              >
                3
              </div>
              <span className="text-sm">Contact Info</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                    placeholder="Full name of patient"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Hospital *
                  </label>
                  <select
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Select hospital</option>
                    {hospitals.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name}
                      </option>
                    ))}
                    <option value="other">Other hospital not listed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location/Address *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                      placeholder="Hospital address or location"
                    />
                    <button
                      type="button"
                      onClick={handleShareLocation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Share current location"
                    >
                      <Navigation className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level *
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="critical">Critical - Within 1 hour</option>
                    <option value="emergency">Urgent - Within 3 hours</option>
                    <option value="high">Moderate - Within 6 hours</option>
                    <option value="normal">Routine - Within 24 hours</option>
                  </select>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    For critical emergencies, please also call emergency
                    services immediately.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Type Needed *
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Units Needed *
                  </label>
                  <input
                    type="number"
                    name="units"
                    value={formData.units}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                    placeholder="Number of units required"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Any specific requirements or notes"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> O-negative blood can be given to
                    anyone in emergency when blood type is unknown.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                    placeholder="Name of contact person"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                    placeholder="Phone number for emergency contact"
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">
                    What happens next?
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>
                      • All nearby compatible donors will be notified
                      immediately
                    </li>
                    <li>• Emergency services will be alerted</li>
                    <li>• You'll receive updates when donors respond</li>
                    <li>• Track request status in real-time</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="ml-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Emergency Request
                      <AlertTriangle className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Find Blood Camps Modal
const FindCampsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(50);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    date: "",
    city: "",
    bloodType: "",
  });

  const loadNearbyCamps = useCallback(
    async (lat, lng) => {
      setLoading(true);
      try {
        const data = await apiService.getNearbyCamps(lat, lng, searchRadius);
        if (data?.camps) {
          setCamps(data.camps);
        }
      } catch (error) {
        console.error("Error loading nearby camps:", error);
        toast.error("Failed to load nearby camps");
      } finally {
        setLoading(false);
      }
    },
    [searchRadius],
  );

  const loadAllCamps = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const data = await apiService.getUpcomingCamps();
      if (data?.camps) {
        setCamps(data.camps);
      }
    } catch (error) {
      console.error("Error loading camps:", error);
      if (!silent) {
        toast.error("Failed to load camps");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useCampRealtime(() => {
    if (isOpen) {
      if (userLocation?.latitude && userLocation?.longitude) {
        loadNearbyCamps(userLocation.latitude, userLocation.longitude);
      } else {
        loadAllCamps({ silent: true });
      }
    }
  }, { publicOnly: true, enabled: isOpen });

  // Define getUserLocation with useCallback to memoize the function
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            zoom: 15,
          });
          loadNearbyCamps(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          loadAllCamps();
          toast.error(
            "Could not get your location. Showing all camps instead.",
          );
        },
      );
    } else {
      loadAllCamps();
      toast.error("Geolocation not supported. Showing all camps instead.");
    }
  }, [loadNearbyCamps, loadAllCamps]);

  useEffect(() => {
    if (isOpen) {
      getUserLocation();
    }
  }, [isOpen, getUserLocation]); 

  const handleSearch = () => {
    if (userLocation) {
      loadNearbyCamps(userLocation.lat, userLocation.lng);
    } else {
      loadAllCamps();
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterForCamp = (camp) => {
    if (camp?.isExternal) {
      toast.error(
        "This is a real-time e-RaktKosh camp. Registration from here is not supported. Please contact the camp directly.",
      );
      return;
    }

    const campId = camp?._id;
    const token = localStorage.getItem("token");
    if (token) {
      navigate(`/camp/${campId}/register`);
      onClose();
    } else {
      toast.error("Please login to register for camp");
      navigate("/login");
    }
  };

  const handleShareCamp = (camp) => {
    if (navigator.share) {
      navigator.share({
        title: camp.title,
        text: `Blood donation camp at ${camp.location?.venue}`,
        url: window.location.origin + `/camp/${camp._id}`,
      });
    } else {
      navigator.clipboard.writeText(
        window.location.origin + `/camp/${camp._id}`,
      );
      toast.success("Camp link copied to clipboard!");
    }
  };

  const handleSaveCamp = async (camp) => {
    if (camp?.isExternal) {
      toast.error("Saving is not supported for real-time camps.");
      return;
    }

    const campId = camp?._id;
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setLoading(true);
        // Save camp to user's saved list in the backend
        const response = await apiService.post("/user/save-camp", { campId });

        if (response && response.success) {
          toast.success("Camp saved to your list!");
        } else {
          toast.error(response?.message || "Failed to save camp");
        }
      } catch (error) {
        console.error("Error saving camp:", error);
        toast.error("Failed to save camp. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please login to save camps");
    }
  };

  const filteredCamps = useMemo(() => {
    return camps.filter((camp) => {
      // 1. Filter by City (case-insensitive substring match)
      if (filters.city) {
        const cityQuery = filters.city.toLowerCase().trim();
        const campCity = (camp.location?.city || "").toLowerCase();
        const campVenue = (camp.location?.venue || "").toLowerCase();
        const campAddress = (camp.location?.address || "").toLowerCase();
        if (
          !campCity.includes(cityQuery) &&
          !campVenue.includes(cityQuery) &&
          !campAddress.includes(cityQuery)
        ) {
          return false;
        }
      }

      // 2. Filter by Date (YYYY-MM-DD vs camp.date)
      if (filters.date) {
        const filterDate = new Date(filters.date);
        const campDate = new Date(camp.date);
        if (
          filterDate.getFullYear() !== campDate.getFullYear() ||
          filterDate.getMonth() !== campDate.getMonth() ||
          filterDate.getDate() !== campDate.getDate()
        ) {
          return false;
        }
      }

      // 3. Filter by Blood Type
      if (filters.bloodType) {
        if (
          Array.isArray(camp.bloodTypesNeeded) &&
          camp.bloodTypesNeeded.length > 0
        ) {
          if (!camp.bloodTypesNeeded.includes(filters.bloodType)) {
            return false;
          }
        } else {
          return false;
        }
      }

      return true;
    });
  }, [camps, filters]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Find Blood Donation Camps
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Discover nearby camps and schedule your donation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Radius
                </label>
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                  <option value="50">Within 50 km</option>
                  <option value="100">Within 100 km</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Type
                </label>
                <select
                  name="bloodType"
                  value={filters.bloodType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Types</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search Camps
              </button>
            </div>
          </div>

          {/* Camps List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          ) : filteredCamps.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No camps found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search radius
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCamps.map((camp) => (
                <div
                  key={camp._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {camp.title}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span>
                            {camp.location?.venue}, {camp.location?.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-red-500" />
                          <span>
                            {new Date(camp.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-red-500" />
                          <span>
                            {camp.time?.start} - {camp.time?.end}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4 text-red-500" />
                          <span>
                            {(camp.registeredCount ??
                              camp.registeredDonors?.length ??
                              0) + " registered"}
                          </span>
                        </div>
                      </div>
                      {Array.isArray(camp.bloodTypesNeeded) &&
                        camp.bloodTypesNeeded.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {camp.bloodTypesNeeded.map((type, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveCamp(camp)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Save camp"
                      >
                        <Bookmark className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleShareCamp(camp)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Share camp"
                      >
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleRegisterForCamp(camp)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};;;

// Registration Modal Component
const RegistrationModal = ({ isOpen, onClose, userType }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    bloodType: "",
    age: "",
    weight: "",
    hospitalName: "",
    labName: "",
    licenseNumber: "",
    address: "",
    city: "",
    registrationNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep = () => {
    if (step === 1) {
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        toast.error("Please fill in all required fields");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (userType === "donor") {
        response = await apiService.registerDonor({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          bloodType: formData.bloodType,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
        });
      } else if (userType === "hospital") {
        response = await apiService.registerHospital({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          hospitalName: formData.hospitalName,
          licenseNumber: formData.licenseNumber,
          address: formData.address,
          city: formData.city,
        });
      } else if (userType === "blood-lab") {
        response = await apiService.registerBloodLab({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          labName: formData.labName,
          registrationNumber: formData.registrationNumber,
          address: formData.address,
          city: formData.city,
        });
      }

      if (response && response.success) {
        toast.success("Registration successful! Please login.");
        onClose();
        navigate("/login");
      } else {
        toast.error(response?.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (userType) {
      case "donor":
        return "Register as Blood Donor";
      case "hospital":
        return "Register Hospital";
      case "blood-lab":
        return "Register Blood Lab";
      default:
        return "Register";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Next Step
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userType === "donor" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Type *
                    </label>
                    <select
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      min="18"
                      max="65"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      min="50"
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                </>
              )}

              {userType === "hospital" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hospital Name *
                    </label>
                    <input
                      type="text"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number *
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                </>
              )}

              {userType === "blood-lab" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lab Name *
                    </label>
                    <input
                      type="text"
                      name="labName"
                      value={formData.labName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </div>
    </div>
  );
};

// Newsletter subscription component
const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    const success = await apiService.subscribeNewsletter(email);
    setLoading(false);

    if (success) {
      setSubscribed(true);
      setEmail("");
      toast.success("Successfully subscribed to newsletter!");
      setTimeout(() => setSubscribed(false), 3000);
    } else {
      toast.error("Subscription failed. Please try again.");
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
          <p className="text-red-100 mb-6">
            Subscribe to our newsletter for blood donation drives and health
            tips
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          {subscribed && (
            <p className="text-green-300 mt-3 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Thank you for subscribing!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Live stats counter component
const LiveStats = ({ target, label, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [isVisible, target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

// Upcoming camps carousel
const UpcomingCamps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCamps = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const data = await apiService.getUpcomingCamps();
      if (data?.camps) {
        setCamps(data.camps.slice(0, 3));
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCamps();
  }, [loadCamps]);

  useCampRealtime(() => {
    loadCamps({ silent: true });
  }, { publicOnly: true });

  const handleRegisterForCamp = (camp) => {
    if (camp?.isExternal) {
      toast.error(
        "Real-time e-RaktKosh camps cannot be registered from this UI. Please contact the camp directly.",
      );
      return;
    }

    const campId = camp?._id;
    const token = localStorage.getItem("token");
    if (token) {
      navigate(`/camp/${campId}/register`);
    } else {
      toast.error("Please login to register for camp");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (camps.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 max-w-md mx-auto">
        <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <span className="font-semibold text-slate-600 block mb-1">No Camps Scheduled</span>
        <span className="text-xs">Check back soon for upcoming donation drives.</span>
      </div>
    );
  }

  const userStr = localStorage.getItem("user");
  let currentUser = null;
  if (userStr) {
    try {
      currentUser = JSON.parse(userStr);
    } catch (error) {
      console.warn("Failed to parse user from localStorage:", error);
    }
  }
  const currentDonorId = currentUser?._id;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
      {camps.map((camp) => {
        const isRegistered = currentDonorId && camp.registeredDonors?.some(
          (reg) =>
            (reg.donor && reg.donor.toString() === currentDonorId.toString()) ||
            (reg._id && reg._id.toString() === currentDonorId.toString())
        );

        return (
          <div
            key={camp._id}
            className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
          >
            {/* Red accent top-line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-600"></div>

            <div className="flex-grow">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Active Drive
              </span>
              
              <h4 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 min-h-[56px] leading-snug">
                {camp.title}
              </h4>
              
              <p className="text-slate-500 text-xs line-clamp-2 mb-6 min-h-[32px] leading-relaxed">
                {camp.description || "Join our emergency blood donation campaign to support local hospitals and save critical lives."}
              </p>

              {/* Details List */}
              <div className="space-y-3.5 text-sm text-slate-600 border-t border-slate-100 pt-5 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2 leading-tight">
                    {camp.location?.venue}, {camp.location?.city}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="font-semibold text-slate-700">
                    {new Date(camp.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-slate-500">
                    {camp.time?.start} - {camp.time?.end}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div>
              {isRegistered ? (
                <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold py-3.5 px-6 rounded-2xl text-sm transition-all shadow-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Already Registered
                </div>
              ) : (
                <button
                  onClick={() => handleRegisterForCamp(camp)}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Register to Donate
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Emergency needs with real-time updates
const EmergencyNeeds = () => {
  const navigate = useNavigate();

  const handleEmergencyRequest = (needType) => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(`/blood-request?type=${encodeURIComponent(needType)}`);
    } else {
      toast.error("Please login to make an emergency request");
      navigate("/login");
    }
  };

  const defaultNeeds = [
    {
      type: "Accident Victims",
      units: "Up to 100 units",
      icon: AlertTriangle,
      color: "red",
    },
    {
      type: "Cancer Patients",
      units: "8 units weekly",
      icon: Heart,
      color: "purple",
    },
    {
      type: "Surgery Patients",
      units: "5-10 units",
      icon: Stethoscope,
      color: "blue",
    },
    {
      type: "Burn Victims",
      units: "20+ units",
      icon: Activity,
      color: "orange",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
      {defaultNeeds.map((need, index) => {
        const Icon = need.icon;
        const colorClasses = {
          red: "bg-red-100 text-red-600",
          purple: "bg-purple-100 text-purple-600",
          blue: "bg-blue-100 text-blue-600",
          orange: "bg-orange-100 text-orange-600",
        };
        const color = need.color || "red";

        return (
          <div
            key={index}
            className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:-translate-y-1 cursor-pointer"
            onClick={() => handleEmergencyRequest(need.type)}
          >
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-xl ${colorClasses[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {need.type}
            </h3>
            <p className="text-2xl font-bold text-red-600 mb-2">{need.units}</p>
            <p className="text-sm text-gray-500">urgently needed</p>
          </div>
        );
      })}
    </div>
  );
};

// Impact metrics with real data
const ImpactMetrics = () => {
  const [stats, setStats] = useState({
    livesSaved: 10000,
    bloodUnits: 50000,
    partnerHospitals: 150,
    activeDonors: 25000,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const data = await apiService.getStats();
      if (data) {
        setStats(data);
      }
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
      <LiveStats target={stats.livesSaved} label="Lives Saved" suffix="+" />
      <LiveStats target={stats.bloodUnits} label="Blood Units" suffix="+" />
      <LiveStats
        target={stats.partnerHospitals}
        label="Partner Hospitals"
        suffix="+"
      />
      <LiveStats target={stats.activeDonors} label="Active Donors" suffix="+" />
    </div>
  );
};

// Dynamic Blood Needs Component with Compatibility Matrix & Live Stats
const BloodNeeds = () => {
  const [needs, setNeeds] = useState([
    { type: "A+", need: "High", donors: "32%", requestedUnits: 12, requestsCount: 3 },
    { type: "A-", need: "Critical", donors: "8%", requestedUnits: 18, requestsCount: 4 },
    { type: "B+", need: "Medium", donors: "12%", requestedUnits: 6, requestsCount: 2 },
    { type: "B-", need: "High", donors: "3%", requestedUnits: 10, requestsCount: 2 },
    { type: "O+", need: "High", donors: "35%", requestedUnits: 14, requestsCount: 3 },
    { type: "O-", need: "Critical", donors: "5%", requestedUnits: 22, requestsCount: 5 },
    { type: "AB+", need: "Low", donors: "4%", requestedUnits: 0, requestsCount: 0 },
    { type: "AB-", need: "Medium", donors: "1%", requestedUnits: 4, requestsCount: 1 },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNeeds = async () => {
      try {
        const response = await publicApi.getEmergencyNeeds();
        if (response.data?.success && response.data.needs?.length > 0) {
          setNeeds(response.data.needs);
        }
      } catch (error) {
        console.error("Failed to load blood needs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadNeeds();
    const interval = setInterval(loadNeeds, 30000);
    return () => clearInterval(interval);
  }, []);

  const compatibility = {
    "O-": { receive: ["O-"], give: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], desc: "Universal Donor. Critical in emergency situations as it can be transfused to any patient." },
    "O+": { receive: ["O-", "O+"], give: ["O+", "A+", "B+", "AB+"], desc: "Most common blood group. High demand because it is compatible with all positive blood types." },
    "A-": { receive: ["O-", "A-"], give: ["A-", "A+", "AB-", "AB+"], desc: "Rare blood type. Very important for emergency trauma units." },
    "A+": { receive: ["O-", "O+", "A-", "A+"], give: ["A+", "AB+"], desc: "Highly active in the community. Frequently requested for elective and urgent surgeries." },
    "B-": { receive: ["O-", "B-"], give: ["B-", "B+", "AB-", "AB+"], desc: "Extremely rare blood group. Critical need for patients with chronic blood conditions." },
    "B+": { receive: ["O-", "O+", "B-", "B+"], give: ["B+", "AB+"], desc: "Common in South Asia. Fulfillable by wide range of donors, but constantly needed." },
    "AB-": { receive: ["O-", "A-", "B-", "AB-"], give: ["AB-", "AB+"], desc: "Second rarest blood type. Plasma from AB- is highly valuable and versatile." },
    "AB+": { receive: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], give: ["AB+"], desc: "Universal Recipient. Can receive blood cells from any blood group during transfusion." },
  };

  const handleAction = (type, path) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to proceed");
      navigate("/login");
      return;
    }
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
      </div>
    );
  }



  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {needs.map((blood, index) => {
          const isCritical = blood.need === "Critical";
          const isHigh = blood.need === "High";
          const isMedium = blood.need === "Medium";
          
          let cardBg = "from-slate-50 to-white";
          let borderStyle = "border-slate-100 hover:border-slate-300";
          let badgeColor = "bg-sky-50 text-sky-700 border-sky-100/60";
          let liquidColor = "bg-gradient-to-r from-sky-400 to-indigo-500";
          let glowLight = "rgba(14,165,233,0.03)";
          let urgencyPct = "15%";

          if (isCritical) {
            cardBg = "from-red-50/20 to-white";
            borderStyle = "border-red-100 hover:border-red-300";
            badgeColor = "bg-red-50 text-red-700 border-red-100";
            liquidColor = "bg-gradient-to-r from-red-500 to-rose-600 animate-pulse";
            glowLight = "rgba(239,68,68,0.08)";
            urgencyPct = "90%";
          } else if (isHigh) {
            cardBg = "from-amber-50/25 to-white";
            borderStyle = "border-amber-100 hover:border-amber-300";
            badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
            liquidColor = "bg-gradient-to-r from-amber-500 to-orange-500";
            glowLight = "rgba(245,158,11,0.06)";
            urgencyPct = "65%";
          } else if (isMedium) {
            cardBg = "from-emerald-50/15 to-white";
            borderStyle = "border-emerald-100 hover:border-emerald-200";
            badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
            liquidColor = "bg-gradient-to-r from-emerald-500 to-teal-500";
            glowLight = "rgba(16,185,129,0.04)";
            urgencyPct = "40%";
          }

          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${cardBg} border ${borderStyle} rounded-3xl p-5 text-left transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer relative overflow-hidden group`}
              style={{
                boxShadow: `0 10px 30px -10px rgba(0,0,0,0.04), inset 0 0 40px ${glowLight}`,
              }}
              onClick={() => setSelectedType(blood.type)}
            >
              <div className="absolute -right-10 -top-10 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all duration-500" />
              
              <div className="flex justify-between items-start mb-4">
                <div className={`text-4xl font-extrabold tracking-tight ${
                  isCritical ? "text-red-600" : isHigh ? "text-amber-600" : isMedium ? "text-emerald-600" : "text-sky-600"
                }`}>
                  {blood.type}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeColor}`}>
                  {blood.need}
                </span>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-[9px] font-extrabold text-slate-400 tracking-wider">
                  <span>DEPLETED</span>
                  <span>{urgencyPct} URGENT</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100/80 rounded-full overflow-hidden relative border border-slate-200/40 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${liquidColor}`}
                    style={{ width: urgencyPct }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  {blood.donors} Share
                </span>
                {blood.requestsCount > 0 && (
                  <span className="bg-red-500/10 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-black animate-pulse">
                    {blood.requestsCount} Alert{blood.requestsCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 origin-center animate-fade-in">
          <div className="bg-white rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 relative p-6 sm:p-8 animate-scale-in">
            <button
              onClick={() => setSelectedType(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-red-500/20">
                {selectedType}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">
                  Type {selectedType} Compatibility
                </h3>
                <p className="text-sm font-bold text-red-500 uppercase tracking-wider">
                  Live Needs: {needs.find(n => n.type === selectedType)?.need} Demand
                </p>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-6 bg-slate-50/60 p-4 rounded-2xl border border-slate-100/50">
              {compatibility[selectedType]?.desc}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-red-50/30 border border-red-100/50 rounded-2xl p-4">
                <h4 className="text-xs font-black text-red-700 uppercase tracking-wider mb-2">
                  Can Receive From:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {compatibility[selectedType]?.receive.map((t) => (
                    <span
                      key={t}
                      className="bg-white text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-red-100 shadow-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-4">
                <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-2">
                  Can Donate To:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {compatibility[selectedType]?.give.map((t) => (
                    <span
                      key={t}
                      className="bg-white text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-100 shadow-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-6 bg-slate-50/50 border border-slate-100 px-4 py-3 rounded-2xl">
              <span>HOSPITAL REQUESTS: {needs.find(n => n.type === selectedType)?.requestsCount || 0}</span>
              <span>UNITS NEEDED: {needs.find(n => n.type === selectedType)?.requestedUnits || 0} UNITS</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={() => {
                  setSelectedType(null);
                  handleAction(selectedType, "/camps");
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/10 hover:shadow-red-500/20 text-center transition-all duration-300 text-sm"
              >
                Donate for {selectedType}
              </button>
              <button
                onClick={() => {
                  setSelectedType(null);
                  handleAction(selectedType, `/blood-request?type=${selectedType}`);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-center transition-all duration-300 text-sm"
              >
                Request Type {selectedType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showCampsModal, setShowCampsModal] = useState(false);
  const [registrationType, setRegistrationType] = useState(null);
  const [user, setUser] = useState(null);
  const quickMenuRef = useRef(null);
  const navigate = useNavigate();

  // Data arrays
  const stats = [
    { icon: Users, label: "Lives Saved", value: "10,000+" },
    { icon: Heart, label: "Blood Units", value: "50,000+" },
    { icon: MapPin, label: "Partner Hospitals", value: "150+" },
    { icon: Clock, label: "Response Time", value: "< 30min" },
  ];

  const features = [
    {
      icon: Users,
      title: "Easy Donor Registration",
      description:
        "Simple and secure donor registration process with medical history tracking and eligibility verification.",
      color: "red",
    },
    {
      icon: Droplets,
      title: "Real-time Inventory Tracking",
      description:
        "Monitor blood inventory levels, expiration dates, and distribution in real-time across all partner facilities.",
      color: "blue",
    },
    {
      icon: Zap,
      title: "Quick Response",
      description:
        "Emergency request system with automated matching and notification to ensure rapid response in critical situations.",
      color: "green",
    },
  ];

  const processSteps = [
    {
      step: "01",
      icon: FileText,
      title: "Register & Screen",
      description: "Complete simple registration and health screening process",
    },
    {
      step: "02",
      icon: Search,
      title: "Find Match",
      description: "Our system matches blood needs with compatible donors",
    },
    {
      step: "03",
      icon: Bell,
      title: "Get Notified",
      description: "Receive instant alerts for urgent needs in your area",
    },
    {
      step: "04",
      icon: Heart,
      title: "Donate & Save Lives",
      description: "Visit approved centers and make your life-saving donation",
    },
  ];



  const donationFacts = [
    {
      icon: Heart,
      title: "One Donation, Multiple Lives",
      description:
        "A single blood donation can save up to 3 lives. Your one hour can give someone a lifetime.",
      stat: "3 Lives Saved",
    },
    {
      icon: RefreshCw,
      title: "Blood Regeneration",
      description:
        "Your body replaces the blood you donate within 24-48 hours. The red blood cells are completely replaced in 4-6 weeks.",
      stat: "48 Hours",
    },
    {
      icon: Users,
      title: "Constant Need",
      description:
        "Every 2 seconds, someone needs blood. Your regular donation ensures continuous supply for emergencies.",
      stat: "Every 2 Seconds",
    },
    {
      icon: AlertTriangle,
      title: "Short Shelf Life",
      description:
        "Red blood cells last only 42 days, platelets just 5 days. Regular donations are essential to maintain supply.",
      stat: "42 Days Shelf Life",
    },
  ];

  const eligibilityInfo = [
    {
      icon: CheckCircle,
      title: "Who Can Donate",
      items: [
        "Age 17-75 (16 with parental consent)",
        "Weight at least 110 lbs (50 kg)",
        "Good general health",
        "No flu or cold symptoms",
      ],
    },
    {
      icon: Stethoscope,
      title: "Health Benefits",
      items: [
        "Free health screening",
        "Burns 650 calories per donation",
        "Reduces risk of heart disease",
        "Stimulates blood cell production",
      ],
    },
    {
      icon: Shield,
      title: "Safety First",
      items: [
        "Sterile, disposable equipment",
        "Trained medical staff",
        "Comfortable environment",
        "Post-donation care",
      ],
    },
  ];

  const testimonials = [
    {
      name: "Rahul Mehta",
      role: "Regular Donor",
      quote:
        "I've been donating blood for 5 years now. LifeDrop made it so easy to find camps and track my impact. Knowing I've helped save over 15 lives keeps me motivated.",
      donations: 15,
      image: "/testimonials/rahul_mehta.png",
    },
    {
      name: "Priya Sharma",
      role: "First-time Donor",
      quote:
        "The process was so smooth and the staff was incredibly supportive. I was nervous at first, but they made me feel comfortable throughout. Can't wait to donate again!",
      donations: 1,
      image: "/testimonials/priya_sharma.png",
    },
    {
      name: "Dr. Anjali Desai",
      role: "Hospital Administrator",
      quote:
        "The real-time inventory and emergency request system has been a game-changer for our hospital. We can now get blood units within hours instead of days.",
      hospital: "City General Hospital",
      image: "/testimonials/anjali_desai.png",
    },
  ];

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const userData = await apiService.checkAuthStatus();
      if (userData) {
        setUser(userData.user);
      }
    };
    checkAuth();
  }, []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close quick menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        quickMenuRef.current &&
        !quickMenuRef.current.contains(event.target)
      ) {
        setShowQuickMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGetStarted = () => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      // Redirect to appropriate dashboard based on role
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const role = user?.role;

          const dashboardPaths = {
            donor: "/donor",
            hospital: "/hospital",
            "blood-lab": "/lab",
            admin: "/admin",
          };

          if (role && dashboardPaths[role]) {
            navigate(dashboardPaths[role]);
          } else {
            navigate("/dashboard");
          }
        } catch {
          navigate("/dashboard");
        }
      } else {
        navigate("/dashboard");
      }
    } else {
      // Show registration options in quick menu
      setShowQuickMenu(!showQuickMenu);
    }
  };

  const handleBecomeDonor = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/register/donor");
    } else {
      setRegistrationType("donor");
      setShowRegistrationModal(true);
      setShowQuickMenu(false);
    }
  };

  const handleLearnMore = () => {
    scrollToSection("about");
  };

  const handleEmergencyRequest = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setShowEmergencyModal(true);
    } else {
      toast.error("Please login to make an emergency request");
      navigate("/login");
    }
  };

  const handleFindCamps = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setShowCampsModal(true);
    } else {
      toast.error("Please login to find blood camps");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-red-50">
      <Header user={user} />

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          setRegistrationType(null);
        }}
        userType={registrationType}
      />

      {/* Emergency Request Modal */}
      <EmergencyRequestModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />

      {/* Find Camps Modal */}
      <FindCampsModal
        isOpen={showCampsModal}
        onClose={() => setShowCampsModal(false)}
      />

      {/* Floating Action Button for Quick Actions */}
      <div className="fixed bottom-6 right-6 z-40" ref={quickMenuRef}>
        <button
          onClick={() => setShowQuickMenu(!showQuickMenu)}
          className="w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
          aria-label="Quick actions"
        >
          <Heart className="w-6 h-6" />
        </button>
        <QuickActionMenu
          isOpen={showQuickMenu}
          onClose={() => setShowQuickMenu(false)}
        />
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronDown className="w-5 h-5 rotate-180" />
        </button>
      )}

      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-r from-red-700 to-red-900 text-white mt-16 sm:mt-20 pt-16"
      >
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="30"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="20"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6 backdrop-blur-sm animate-pulse">
              <Heart className="w-4 h-4" />
              Saving Lives Every Day
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Connect{" "}
              <span className="bg-gradient-to-r from-red-200 to-red-300 bg-clip-text text-transparent">
                Blood Donors
              </span>{" "}
              with Those in Need
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-red-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Our advanced blood bank management system ensures efficient
              donation, storage, and distribution of blood products to save
              lives when every second counts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl bg-white text-red-700 hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={handleLearnMore}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl bg-red-800/50 text-white hover:bg-red-800/70 transition-all duration-300 transform hover:scale-105"
              >
                Learn More
                <ChevronDown className="w-5 h-5 ml-2" />
              </button>
            </div>

            {/* Quick stats preview */}
            <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-red-200">Emergency Support</div>
                <button
                  onClick={handleEmergencyRequest}
                  className="mt-2 text-xs text-red-200 hover:text-white underline"
                >
                  Request Now →
                </button>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-red-200">Blood Camps</div>
                <button
                  onClick={handleFindCamps}
                  className="mt-2 text-xs text-red-200 hover:text-white underline"
                >
                  Find Camps →
                </button>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Live</div>
                <div className="text-sm text-red-200">Stock Availability</div>
                <button
                  onClick={() => navigate("/stock-search")}
                  className="mt-2 text-xs text-red-200 hover:text-white underline"
                >
                  Search Directory →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-16"
            viewBox="0 0 1200 150"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V150H0V90.83C36.67,85.19,76.33,76,112,69.33C160.67,59.67,224.67,47.33,321.39,56.44Z"
              className="fill-slate-50"
            ></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center p-4 sm:p-6 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-200 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-red-700" />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-red-700 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Needs Section */}
      <section
        id="needs"
        className="py-20 bg-gradient-to-br from-red-50 to-red-100"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-200 text-red-800 text-sm font-medium mb-4">
              <AlertTriangle className="w-4 h-4" />
              URGENT NEED
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Who Needs Your Blood Right Now?
            </h2>
            <p className="text-lg text-gray-600">
              Real-time emergency requirements across our network
            </p>
          </div>

          <EmergencyNeeds />

          <div className="text-center mt-8">
            <button
              onClick={handleEmergencyRequest}
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              View All Emergency Requests
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Upcoming Blood Camps */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Blood Donation Camps
            </h2>
            <p className="text-lg text-gray-600">
              Find a camp near you and schedule your donation
            </p>
          </div>

          <UpcomingCamps />

          <div className="text-center mt-8">
            <button
              onClick={handleFindCamps}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Find More Camps
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Blood Need Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Current Blood Needs
            </h2>
            <p className="text-lg text-gray-600">
              Real-time blood type requirements across our network. Your
              donation matters now more than ever.
            </p>
          </div>

          <BloodNeeds />
        </div>
      </section>

      {/* Why Donate Blood Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Your Blood Donation Matters
            </h2>
            <p className="text-lg text-gray-600">
              Every donation creates a ripple effect of hope and healing in our
              community.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {donationFacts.map((fact, index) => {
              const Icon = fact.icon;
              return (
                <div
                  key={index}
                  className="bg-slate-50 rounded-2xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-300 border-t-4 border-red-500 hover:-translate-y-2"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">
                    {fact.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {fact.description}
                  </p>
                  <div className="text-red-600 font-bold text-lg">
                    {fact.stat}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to become a life-saver. Join thousands of donors
              making a difference.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center group">
                  <div
                    className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-red-500 group-hover:transform group-hover:-translate-y-2 cursor-pointer"
                    onClick={() => {
                      if (index === 0) {
                        handleBecomeDonor();
                      } else if (index === 1) {
                        navigate("/find-match");
                      } else if (index === 2) {
                        const token = localStorage.getItem("token");
                        if (token) {
                          navigate("/notifications");
                        } else {
                          toast.error("Please login to manage notifications");
                          navigate("/login");
                        }
                      } else {
                        handleFindCamps();
                      }
                    }}
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                      {step.step}
                    </div>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Eligibility & Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Donor Eligibility & Benefits
            </h2>
            <p className="text-lg text-gray-600">
              Safe, simple, and rewarding - discover the benefits of blood
              donation
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {eligibilityInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div
                  key={index}
                  className="bg-slate-50 rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 text-center">
                    {info.title}
                  </h3>
                  <ul className="space-y-3">
                    {info.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start gap-3 text-gray-600"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Choose Our Blood Bank System?
            </h2>
            <p className="text-lg text-gray-600">
              We provide a comprehensive platform that connects donors,
              hospitals, and blood banks to ensure efficient blood collection
              and distribution.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-300 border-t-4 border-red-500 hover:-translate-y-1"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-10 max-w-5xl mx-auto">
            <div className="flex-1">
              <div className="w-16 h-16 rounded-xl bg-red-100 flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Secure & Compliant
              </h2>
              <p className="text-gray-600 mb-6">
                Our system meets all healthcare data security standards with
                end-to-end encryption and strict compliance with medical
                regulations to protect donor and patient information.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  HIPAA compliant data handling
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  End-to-end encryption
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Regular security audits
                </li>
              </ul>
            </div>
            <div className="flex-1 bg-red-50 rounded-2xl p-8 border border-red-100">
              <div className="aspect-video bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-700 font-medium">
                    Secure Blood Bank Management
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              What Our Donors Say
            </h2>
            <p className="text-lg text-gray-600">
              Real stories from real heroes who made a difference
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-red-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {testimonial.donations && (
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      {testimonial.donations} donations
                    </span>
                  )}
                  {testimonial.hospital && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      {testimonial.hospital}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-700 to-red-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0 0 L100 100 M100 0 L0 100"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Heart className="w-20 h-20 mx-auto mb-6 text-red-300 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Join our community of donors and healthcare professionals working
            together to ensure blood is available when and where it's needed
            most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBecomeDonor}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl bg-white text-red-700 hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Become a Donor <Heart className="w-5 h-5 ml-2" />
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl border-2 border-white text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
            >
              Contact Us <Mail className="w-5 h-5 ml-2" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Verified Donors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Safe & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Free Health Check</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
