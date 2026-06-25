import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  User,
  MessageSquare,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  Heart,
  ChevronDown,
  Shield,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import { toast } from "react-hot-toast";
import { publicApi } from "../../services/api.js";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);

  const [officeHours] = useState({
    monday: "9:00 AM - 8:00 PM",
    tuesday: "9:00 AM - 8:00 PM",
    wednesday: "9:00 AM - 8:00 PM",
    thursday: "9:00 AM - 8:00 PM",
    friday: "9:00 AM - 6:00 PM",
    saturday: "10:00 AM - 4:00 PM",
    sunday: "Closed",
  });

  const cityLocations = {
    ahmedabad: {
      name: "Ahmedabad",
      coordinates: "23.0225,72.5714",
      address: "123 Ashram Road, Ahmedabad - 380009",
      phone: "+91 79 1234 5678",
      email: "ahmedabad@lifedrop.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235527.864211222!2d72.45643551606447!3d22.997412693241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    },
    surat: {
      name: "Surat",
      coordinates: "21.1702,72.8311",
      address: "456 Ring Road, Surat - 395003",
      phone: "+91 261 2345 678",
      email: "surat@lifedrop.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d238132.672637794!2d72.65999131640623!3d21.159509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04e59411d1563%3A0xfe4558290938b042!2sSurat%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000001!5m2!1sen!2sin",
    },
    mumbai: {
      name: "Mumbai",
      coordinates: "19.0760,72.8777",
      address: "789 Marine Drive, Mumbai - 400020",
      phone: "+91 22 3456 7890",
      email: "mumbai@lifedrop.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241316.672899648!2d72.71637321164883!3d19.082502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000002!5m2!1sen!2sin",
    },
    delhi: {
      name: "Delhi",
      coordinates: "28.6139,77.2090",
      address: "321 Connaught Place, New Delhi - 110001",
      phone: "+91 11 4567 8901",
      email: "delhi@lifedrop.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.839234202!2d77.06889754736327!3d28.527580!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700000000003!5m2!1sen!2sin",
    },
    bangalore: {
      name: "Bangalore",
      coordinates: "12.9716,77.5946",
      address: "654 MG Road, Bangalore - 560001",
      phone: "+91 80 5678 9012",
      email: "bangalore@lifedrop.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.886540124!2d77.4908526477539!3d12.953945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000004!5m2!1sen!2sin",
    },
    chennai: {
      name: "Chennai",
      coordinates: "13.0827,80.2707",
      address: "987 Anna Salai, Chennai - 600002",
      phone: "+91 44 6789 0123",
      email: "chennai@lifedrop.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248711.907628477!2d80.091927547802!3d13.067439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x6e61a70b6863d433!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000005!5m2!1sen!2sin",
    },
    kolkata: {
      name: "Kolkata",
      coordinates: "22.5726,88.3639",
      address: "147 Park Street, Kolkata - 700016",
      phone: "+91 33 7890 1234",
      email: "kolkata@lifedrop.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235579.37564154158!2d88.26489951168652!3d22.535564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f882db4908e667%3A0x43e330e68f3c2cbc!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1700000000006!5m2!1sen!2sin",
    },
    hyderabad: {
      name: "Hyderabad",
      coordinates: "17.3850,78.4867",
      address: "258 Banjara Hills, Hyderabad - 500034",
      phone: "+91 40 8901 2345",
      email: "hyderabad@lifedrop.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243287.03440649248!2d78.25802604710558!3d17.412627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93baba92bc6ee!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000007!5m2!1sen!2sin",
    },
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message content is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all verification errors.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await publicApi.postContactMessage(formData);
      if (res.data.success) {
        setIsSuccess(true);
        toast.success(res.data.message || "Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          inquiryType: "general",
        });
        setErrors({});
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to send message. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCityClick = (cityKey) => {
    setSelectedCity(cityLocations[cityKey]);
    setShowMapModal(true);
  };

  const faqs = [
    {
      question: "How quickly do you respond to inquiries?",
      answer:
        "We aim to respond to all inquiries within 24 hours during business days. For emergency blood requests, please use our 24/7 helpline.",
    },
    {
      question: "Can I schedule a blood donation camp?",
      answer:
        "Yes! Organizations can request to host blood donation camps. Fill out the form with 'Camp Organization' as the subject, and our team will contact you.",
    },
    {
      question: "What information should I provide for emergency requests?",
      answer:
        "For emergencies, please call our helpline directly. Include patient details, blood type needed, location, and urgency level.",
    },
    {
      question: "Do you provide support in multiple languages?",
      answer:
        "Yes, we have support staff available in English, Hindi, and regional languages. Please specify your preference in the message.",
    },
  ];



  const MapModal = ({ city, onClose }) => {
    if (!city) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{city.name} Office</h3>
              <p className="text-sm text-gray-600 mt-1">{city.address}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 text-gray-500 hover:text-gray-700 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative h-96">
            <iframe
              title={`${city.name} Office Location`}
              src={city.mapEmbed}
              className="w-full h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>

          <div className="p-5 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-200">
                <Phone className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Helpline</p>
                  <span className="text-sm font-semibold text-gray-800">{city.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-200">
                <Mail className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email Address</p>
                  <span className="text-sm font-semibold text-gray-800">{city.email}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://www.google.com/maps?q=${city.coordinates}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-center text-sm font-semibold transition-colors cursor-pointer"
              >
                Open in Google Maps
              </a>
              <a
                href={`tel:${city.phone.replace(/\D/g, "")}`}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl text-center text-sm font-semibold transition-colors cursor-pointer"
              >
                Call Helpline
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white font-sans text-gray-800">
      <Header />

      {/* Map Modal */}
      {showMapModal && (
        <MapModal city={selectedCity} onClose={() => setShowMapModal(false)} />
      )}

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden mt-16 sm:mt-20 pt-16">
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
        <div className="relative text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Get in <span className="text-red-200">Touch</span>
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            We're here to support you 24/7. Reach out for any help, queries, or
            blood-related emergencies.
          </p>
        </div>
      </section>



      {/* Form and Sidebar Container */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 px-6 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-xl p-8 border border-red-100 self-start h-fit" style={{ alignSelf: "start" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <Send className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Send a Message
              </h2>
            </div>

            {isSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    You sent message successfully to LifeDrop
                  </p>
                  <p className="text-sm text-green-600">
                    We've emailed a receipt to your inbox. An administrator will
                    reply soon.
                  </p>
                </div>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="ml-auto text-gray-400 hover:text-gray-655"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm text-gray-800 bg-white outline-none ${
                        errors.name
                          ? "border-red-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="Enter your name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm text-gray-800 bg-white outline-none ${
                        errors.email
                          ? "border-red-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm text-gray-800 bg-white outline-none ${
                        errors.phone
                          ? "border-red-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="10-digit phone number"
                      maxLength="10"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Inquiry Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inquiry Type
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm text-gray-800 cursor-pointer"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="emergency">Emergency Blood Request</option>
                    <option value="donation">Donation Related</option>
                    <option value="camp">Camp Organization</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-gray-800 bg-white outline-none"
                  placeholder="Brief subject line"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm text-gray-800 bg-white outline-none resize-none ${
                      errors.message
                        ? "border-red-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Write your message here..."
                  />
                </div>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.message.length}/500 characters (minimum 10)
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                By submitting this form, you agree to our
                <a
                  href="/privacy"
                  className="text-red-600 hover:underline ml-1"
                >
                  Privacy Policy
                </a>
              </p>
            </form>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Social handles */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-gray-800">Connect With Us</h4>
                <p className="text-xs text-gray-500 mt-0.5">Stay updated on our campaigns & tips</p>
              </div>
              <div className="flex gap-3">
                {[
                  {
                    icon: Instagram,
                    hover: "hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white hover:scale-110 hover:rotate-3 hover:shadow-lg hover:shadow-pink-500/20 hover:border-transparent",
                    label: "Instagram",
                    href: "https://www.instagram.com/lifedroporg/",
                    colors: "bg-pink-50 border-pink-100 text-pink-600",
                  },
                  {
                    icon: Facebook,
                    hover: "hover:bg-[#1877F2] hover:text-white hover:scale-110 hover:-rotate-3 hover:shadow-lg hover:shadow-[#1877F2]/20 hover:border-transparent",
                    label: "Facebook",
                    href: "https://www.facebook.com/LifeDrop",
                    colors: "bg-blue-50 border-blue-100 text-blue-600",
                  },
                  {
                    icon: Linkedin,
                    hover: "hover:bg-[#0077B5] hover:text-white hover:scale-110 hover:rotate-3 hover:shadow-lg hover:shadow-[#0077B5]/20 hover:border-transparent",
                    label: "LinkedIn",
                    href: "https://www.linkedin.com/company/lifedrop-foundation",
                    colors: "bg-indigo-50 border-indigo-100 text-indigo-700",
                  },
                  {
                    icon: Globe,
                    hover: "hover:bg-red-600 hover:text-white hover:scale-110 hover:-rotate-3 hover:shadow-lg hover:shadow-red-600/20 hover:border-transparent",
                    label: "Website",
                    href: "https://www.lifedrop.org",
                    colors: "bg-red-50 border-red-100 text-red-600",
                  },
                ].map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${social.colors} ${social.hover} cursor-pointer shadow-sm`}
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Unified Contact Info Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl shadow-xl p-8 border border-red-100 self-start h-fit animate-fade-in" style={{ alignSelf: "start" }}>
            <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              Contact Information
            </h3>

            {/* Helpline and Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 mb-6">
              <a
                href="tel:18002566369"
                className="flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Helpline 24/7</p>
                  <p className="text-sm font-bold text-red-700 mt-0.5">1800-256-6369</p>
                </div>
              </a>

              <a
                href="mailto:help@lifedrop.org"
                className="flex items-center gap-3 p-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Email Us</p>
                  <p className="text-sm font-bold text-blue-700 mt-0.5 truncate" title="help@lifedrop.org">help@lifedrop.org</p>
                </div>
              </a>
            </div>

            {/* Office Hours */}
            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                Office Hours
              </h4>
              <div className="space-y-1.5">
                {Object.entries(officeHours).map(([day, hours]) => {
                  const currentDayName = new Date()
                    .toLocaleDateString("en-US", { weekday: "long" })
                    .toLowerCase();
                  const isToday = day === currentDayName;
                  return (
                    <div
                      key={day}
                      className={`flex justify-between items-center text-xs p-1.5 rounded-lg ${
                        isToday
                          ? "bg-red-50 border border-red-100 font-bold text-red-700"
                          : "text-gray-600"
                      }`}
                    >
                      <span className="capitalize">{day}</span>
                      <span
                        className={`font-semibold ${
                          hours === "Closed"
                            ? "text-red-600"
                            : isToday
                              ? "text-red-700"
                              : "text-gray-800"
                        }`}
                      >
                        {hours}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regional Centers */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                Regional Centers
              </h3>
              <p className="text-xs text-gray-500 mb-3">Select a city to view local support details and location maps:</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(cityLocations).map((cityKey) => (
                  <button
                    key={cityKey}
                    onClick={() => handleCityClick(cityKey)}
                    className="px-3 py-1.5 bg-white hover:bg-red-600 hover:text-white hover:border-transparent text-xs font-semibold text-gray-700 transition-colors border border-gray-200 rounded-lg cursor-pointer"
                  >
                    {cityLocations[cityKey].name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <MessageSquare className="w-6 h-6 text-red-600" />
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 mt-2">Find quick answers to common support and campaign inquiries</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 transition-all duration-300"
              >
                <button
                  onClick={() =>
                    setActiveFaq(activeFaq === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-gray-700 text-sm">
                    {faq.question}
                  </span>
                  <span className="text-red-600 text-xl font-bold">
                    {activeFaq === index ? "−" : "+"}
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
