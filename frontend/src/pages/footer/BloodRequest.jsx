// src/pages/footer/BloodRequest.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import {
  Droplet,
  AlertCircle,
  Search,
  Filter,
  Hospital,
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Users,
  Heart,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  Activity,
  Thermometer,
  Syringe,
  Stethoscope,
  Ambulance,
  FileText,
  UserCheck,
  Shield,
  Navigation,
  AlertTriangle,
  Info,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

const BloodRequest = () => {
  // Scroll to top on page load
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({
    patientName: "",
    bloodType: "",
    units: "",
    hospital: "",
    city: "",
    contactPerson: "",
    phone: "",
    email: "",
    urgency: "normal",
    requiredBy: "",
    reason: "",
    additionalInfo: "",
  });
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Blood types
  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // Cities
  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
  ];

  // Mock blood requests
  React.useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockRequests = [
          {
            id: 1,
            patientName: "Patient Emergency",
            bloodType: "O+",
            units: 3,
            hospital: "City General Hospital",
            city: "Mumbai",
            urgency: "emergency",
            requiredBy: "2026-03-20",
            contactPerson: "Dr. Sharma",
            phone: "+91 98765 43210",
            email: "cityhospital@example.com",
            status: "urgent",
            postedAt: "2026-03-19T10:30:00",
            donorsResponded: 2,
          },
          {
            id: 2,
            patientName: "Surgery Required",
            bloodType: "A+",
            units: 2,
            hospital: "Apollo Hospital",
            city: "Delhi",
            urgency: "high",
            requiredBy: "2026-03-21",
            contactPerson: "Dr. Reddy",
            phone: "+91 99887 66554",
            email: "apollo@example.com",
            status: "high",
            postedAt: "2026-03-19T09:15:00",
            donorsResponded: 1,
          },
          {
            id: 3,
            patientName: "Accident Victim",
            bloodType: "B-",
            units: 4,
            hospital: "Trauma Center",
            city: "Bangalore",
            urgency: "critical",
            requiredBy: "2026-03-19",
            contactPerson: "Dr. Kumar",
            phone: "+91 97654 32109",
            email: "trauma@example.com",
            status: "critical",
            postedAt: "2026-03-19T08:00:00",
            donorsResponded: 0,
          },
          {
            id: 4,
            patientName: "Cancer Patient",
            bloodType: "AB+",
            units: 2,
            hospital: "Cancer Institute",
            city: "Chennai",
            urgency: "normal",
            requiredBy: "2026-03-25",
            contactPerson: "Dr. Priya",
            phone: "+91 95678 12340",
            email: "cancerinst@example.com",
            status: "normal",
            postedAt: "2026-03-18T14:20:00",
            donorsResponded: 3,
          },
          {
            id: 5,
            patientName: "Thalassemia Patient",
            bloodType: "O-",
            units: 2,
            hospital: "Children's Hospital",
            city: "Kolkata",
            urgency: "high",
            requiredBy: "2026-03-22",
            contactPerson: "Dr. Gupta",
            phone: "+91 93333 44556",
            email: "children@example.com",
            status: "high",
            postedAt: "2026-03-18T11:45:00",
            donorsResponded: 1,
          },
        ];

        setRequests(mockRequests);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Failed to load blood requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      searchTerm === "" ||
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBloodType =
      selectedBloodType === "all" || request.bloodType === selectedBloodType;
    const matchesCity = selectedCity === "all" || request.city === selectedCity;
    const matchesUrgency = urgency === "all" || request.urgency === urgency;

    return matchesSearch && matchesBloodType && matchesCity && matchesUrgency;
  });

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle request submission
  const handleSubmitRequest = (e) => {
    e.preventDefault();

    // Validate form
    if (
      !requestForm.patientName ||
      !requestForm.bloodType ||
      !requestForm.units ||
      !requestForm.hospital ||
      !requestForm.city ||
      !requestForm.contactPerson ||
      !requestForm.phone ||
      !requestForm.requiredBy
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Simulate API call
    toast.success(
      "Blood request submitted successfully! Donors will be notified.",
    );
    setShowRequestForm(false);
    setRequestForm({
      patientName: "",
      bloodType: "",
      units: "",
      hospital: "",
      city: "",
      contactPerson: "",
      phone: "",
      email: "",
      urgency: "normal",
      requiredBy: "",
      reason: "",
      additionalInfo: "",
    });
  };

  // Get urgency badge color
  const getUrgencyColor = (urgency) => {
    const colors = {
      critical: "bg-red-100 text-red-800 border-red-200",
      emergency: "bg-orange-100 text-orange-800 border-orange-200",
      high: "bg-yellow-100 text-yellow-800 border-yellow-200",
      normal: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[urgency] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Get urgency icon
  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case "critical":
      case "emergency":
        return <AlertTriangle className="w-4 h-4" />;
      case "high":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Calculate time ago
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  // Handle respond to request
  const handleRespond = (request) => {
    toast.success(
      `Thank you for responding to blood request for ${request.bloodType}. The hospital will contact you soon.`,
    );
  };

  return (
    <>
      <Helmet>
        <title>Blood Request - Urgent Blood Needs | BloodConnect</title>
        <meta
          name="description"
          content="View and respond to urgent blood requests. Post blood requirements for patients in need. Connect with donors instantly."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Ambulance className="w-4 h-4" />
                <span className="text-sm font-medium">
                  24/7 Emergency Blood Request
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Blood Request Portal
              </h1>
              <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
                Connect with blood donors instantly. Post requirements or
                respond to urgent blood needs in your area.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">
                    {requests.length}
                  </div>
                  <div className="text-sm text-red-200">Active Requests</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">
                    {
                      requests.filter(
                        (r) =>
                          r.urgency === "critical" || r.urgency === "emergency",
                      ).length
                    }
                  </div>
                  <div className="text-sm text-red-200">Urgent Needs</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">15+</div>
                  <div className="text-sm text-red-200">Available Donors</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-red-200">Emergency Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <button
              onClick={() => setShowRequestForm(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              Post Blood Request
            </button>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedBloodType}
                onChange={(e) => setSelectedBloodType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="all">All Blood Types</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="all">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="all">All Urgency</option>
                <option value="critical">Critical</option>
                <option value="emergency">Emergency</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient, hospital, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading blood requests...</p>
            </div>
          )}

          {/* Requests List */}
          {!loading && (
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No Requests Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    There are no blood requests matching your criteria
                  </p>
                  <button
                    onClick={() => {
                      setSelectedBloodType("all");
                      setSelectedCity("all");
                      setUrgency("all");
                      setSearchTerm("");
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border-l-4"
                    style={{
                      borderLeftColor:
                        request.urgency === "critical"
                          ? "#dc2626"
                          : request.urgency === "emergency"
                            ? "#ea580c"
                            : request.urgency === "high"
                              ? "#ca8a04"
                              : "#16a34a",
                    }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Section - Main Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <Droplet className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl font-bold text-gray-800">
                                {request.bloodType} Blood Required
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(request.urgency)} flex items-center gap-1`}
                              >
                                {getUrgencyIcon(request.urgency)}
                                {request.urgency.charAt(0).toUpperCase() +
                                  request.urgency.slice(1)}
                              </span>
                            </div>
                            <p className="text-gray-600">
                              {request.hospital}, {request.city}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Patient</p>
                            <p className="font-medium text-gray-800">
                              {request.patientName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Units Needed
                            </p>
                            <p className="font-medium text-gray-800">
                              {request.units} units
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Required By</p>
                            <p className="font-medium text-gray-800">
                              {new Date(
                                request.requiredBy,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Posted</p>
                            <p className="font-medium text-gray-800">
                              {timeAgo(request.postedAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">
                            {request.donorsResponded} donors responded
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespond(request)}
                            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-2"
                          >
                            <Heart className="w-4 h-4" />
                            Respond
                          </button>
                          <button
                            onClick={() =>
                              (window.location.href = `tel:${request.phone}`)
                            }
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-blue-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                All blood requests are verified by our team before posting
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Donors must meet eligibility criteria before responding
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Emergency requests are prioritized and shown at the top
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Contact the hospital directly for more information
              </li>
            </ul>
          </div>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Post Blood Request
                  </h2>
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Name *
                      </label>
                      <input
                        type="text"
                        name="patientName"
                        value={requestForm.patientName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Type *
                      </label>
                      <select
                        name="bloodType"
                        value={requestForm.bloodType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        <option value="">Select Blood Type</option>
                        {bloodTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Units Required *
                      </label>
                      <input
                        type="number"
                        name="units"
                        value={requestForm.units}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hospital Name *
                      </label>
                      <input
                        type="text"
                        name="hospital"
                        value={requestForm.hospital}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <select
                        name="city"
                        value={requestForm.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={requestForm.contactPerson}
                        onChange={handleInputChange}
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
                        value={requestForm.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={requestForm.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Urgency Level *
                      </label>
                      <select
                        name="urgency"
                        value={requestForm.urgency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="emergency">Emergency</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Required By *
                      </label>
                      <input
                        type="date"
                        name="requiredBy"
                        value={requestForm.requiredBy}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Requirement
                      </label>
                      <textarea
                        name="reason"
                        value={requestForm.reason}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="e.g., Surgery, Accident, Thalassemia, etc."
                      ></textarea>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Information
                      </label>
                      <textarea
                        name="additionalInfo"
                        value={requestForm.additionalInfo}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Any specific requirements or instructions for donors"
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                    >
                      Submit Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BloodRequest;
