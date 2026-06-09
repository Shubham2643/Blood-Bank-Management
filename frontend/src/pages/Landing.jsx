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
import { useState, useEffect, useRef, useCallback } from "react";
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
          onClick={() => handleNavigation("/register/faculty")}
          className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Register Faculty</p>
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
          onClick={() => handleNavigation("/emergency")}
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
          navigate("/emergency/track/" + response.requestId);
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
                    <option value="urgent">Urgent - Within 3 hours</option>
                    <option value="moderate">Moderate - Within 6 hours</option>
                    <option value="routine">Routine - Within 24 hours</option>
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
          ) : camps.length === 0 ? (
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
              {camps.map((camp) => (
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const loadCamps = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const data = await apiService.getUpcomingCamps();
      if (data?.camps) {
        setCamps(data.camps.slice(0, 5));
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
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
      </div>
    );
  }

  if (camps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No upcoming camps at the moment
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {camps.map((camp) => (
            <div key={camp._id} className="w-full flex-shrink-0 px-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {camp.title}
                </h4>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>
                      {camp.location?.venue}, {camp.location?.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span>{new Date(camp.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span>
                      {camp.time?.start} - {camp.time?.end}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRegisterForCamp(camp)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                >
                  Register to Donate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {camps.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {camps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "w-6 bg-red-600" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Emergency needs with real-time updates
const EmergencyNeeds = () => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNeeds = async () => {
      const data = await apiService.getEmergencyNeeds();
      if (data?.needs) {
        setNeeds(data.needs);
      }
      setLoading(false);
    };
    loadNeeds();

    // Poll for updates every 30 seconds
    const interval = setInterval(loadNeeds, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleEmergencyRequest = (needType) => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(`/emergency/request?type=${encodeURIComponent(needType)}`);
    } else {
      toast.error("Please login to make an emergency request");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
      </div>
    );
  }

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

  const displayNeeds = needs.length > 0 ? needs : defaultNeeds;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
      {displayNeeds.map((need, index) => {
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

  const bloodTypes = [
    { type: "A+", need: "High", donors: "32%" },
    { type: "A-", need: "Critical", donors: "8%" },
    { type: "B+", need: "Medium", donors: "12%" },
    { type: "B-", need: "High", donors: "3%" },
    { type: "O+", need: "High", donors: "35%" },
    { type: "O-", need: "Critical", donors: "5%" },
    { type: "AB+", need: "Low", donors: "4%" },
    { type: "AB-", need: "Medium", donors: "1%" },
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
        "I've been donating blood for 5 years now. BloodConnect made it so easy to find camps and track my impact. Knowing I've helped save over 15 lives keeps me motivated.",
      donations: 15,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      name: "Priya Sharma",
      role: "First-time Donor",
      quote:
        "The process was so smooth and the staff was incredibly supportive. I was nervous at first, but they made me feel comfortable throughout. Can't wait to donate again!",
      donations: 1,
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
    },
    {
      name: "Dr. Anjali Desai",
      role: "Hospital Administrator",
      quote:
        "The real-time inventory and emergency request system has been a game-changer for our hospital. We can now get blood units within hours instead of days.",
      hospital: "City General Hospital",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
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
      navigate("/donor/register");
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

      {/* Hero Section */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-r from-red-700 to-red-900 text-white pt-20"
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
                <div className="text-2xl font-bold text-white">99.8%</div>
                <div className="text-sm text-red-200">Safety Rate</div>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {bloodTypes.map((blood, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-3 sm:p-4 text-center hover:shadow-xl transition-all duration-300 border border-gray-200 hover:-translate-y-1 cursor-pointer"
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (token) {
                    navigate(`/blood-type/${blood.type}`);
                  } else {
                    toast.error("Please login to view blood type details");
                    navigate("/login");
                  }
                }}
              >
                <div
                  className={`text-2xl font-bold mb-2 ${
                    blood.need === "Critical"
                      ? "text-red-600"
                      : blood.need === "High"
                        ? "text-orange-500"
                        : "text-green-500"
                  }`}
                >
                  {blood.type}
                </div>
                <div
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    blood.need === "Critical"
                      ? "bg-red-100 text-red-700"
                      : blood.need === "High"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {blood.need} Need
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {blood.donors} Donors
                </div>
              </div>
            ))}
          </div>
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
