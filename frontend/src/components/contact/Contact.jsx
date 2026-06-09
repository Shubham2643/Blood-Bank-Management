import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  User,
  MessageSquare,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import { toast } from "react-hot-toast";

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

  // City coordinates for Google Maps
  const cityLocations = {
    ahmedabad: {
      name: "Ahmedabad",
      coordinates: "23.0225,72.5714",
      address: "123 Ashram Road, Ahmedabad - 380009",
      phone: "+91 79 1234 5678",
      email: "ahmedabad@bloodconnect.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235527.864211222!2d72.45643551606447!3d22.997412693241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    },
    surat: {
      name: "Surat",
      coordinates: "21.1702,72.8311",
      address: "456 Ring Road, Surat - 395003",
      phone: "+91 261 2345 678",
      email: "surat@bloodconnect.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d238132.672637794!2d72.65999131640623!3d21.159509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04e59411d1563%3A0xfe4558290938b042!2sSurat%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000001!5m2!1sen!2sin",
    },
    mumbai: {
      name: "Mumbai",
      coordinates: "19.0760,72.8777",
      address: "789 Marine Drive, Mumbai - 400020",
      phone: "+91 22 3456 7890",
      email: "mumbai@bloodconnect.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241316.672899648!2d72.71637321164883!3d19.082502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000002!5m2!1sen!2sin",
    },
    delhi: {
      name: "Delhi",
      coordinates: "28.6139,77.2090",
      address: "321 Connaught Place, New Delhi - 110001",
      phone: "+91 11 4567 8901",
      email: "delhi@bloodconnect.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.839234202!2d77.06889754736327!3d28.527580!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700000000003!5m2!1sen!2sin",
    },
    bangalore: {
      name: "Bangalore",
      coordinates: "12.9716,77.5946",
      address: "654 MG Road, Bangalore - 560001",
      phone: "+91 80 5678 9012",
      email: "bangalore@bloodconnect.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.886540124!2d77.4908526477539!3d12.953945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000004!5m2!1sen!2sin",
    },
    chennai: {
      name: "Chennai",
      coordinates: "13.0827,80.2707",
      address: "987 Anna Salai, Chennai - 600002",
      phone: "+91 44 6789 0123",
      email: "chennai@bloodconnect.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248711.907628477!2d80.091927547802!3d13.067439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x6e61a70b6863d433!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000005!5m2!1sen!2sin",
    },
    kolkata: {
      name: "Kolkata",
      coordinates: "22.5726,88.3639",
      address: "147 Park Street, Kolkata - 700016",
      phone: "+91 33 7890 1234",
      email: "kolkata@bloodconnect.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235579.37564154158!2d88.26489951168652!3d22.535564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f882db4908e667%3A0x43e330e68f3c2cbc!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1700000000006!5m2!1sen!2sin",
    },
    hyderabad: {
      name: "Hyderabad",
      coordinates: "17.3850,78.4867",
      address: "258 Banjara Hills, Hyderabad - 500034",
      phone: "+91 40 8901 2345",
      email: "hyderabad@bloodconnect.org",
      mapEmbed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243287.03440649248!2d78.25802604710558!3d17.412627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93baba92bc6ee!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000007!5m2!1sen!2sin",
    },
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle phone number - only allow digits
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success
      setIsSuccess(true);
      toast.success(
        "Message sent successfully! We'll respond within 24 hours.",
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "general",
      });
      setErrors({});

      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch {
      toast.error("Failed to send message. Please try again.");
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
        "Yes, we have support staff available in English, Hindi, Spanish, and Mandarin. Please specify your preferred language in the message.",
    },
  ];

  const contactCards = [
    {
      icon: Phone,
      title: "Emergency Helpline",
      primary: "+91 9876543210",
      secondary: "24/7 Available",
      color: "red",
      action: "Call Now",
      link: "tel:+919876543210",
    },
    {
      icon: Mail,
      title: "Email Support",
      primary: "help@bloodconnect.org",
      secondary: "support@bloodconnect.org",
      color: "blue",
      action: "Send Email",
      link: "mailto:help@bloodconnect.org",
    },
    {
      icon: MapPin,
      title: "Regional Offices",
      primary: "Major Cities Across India",
      secondary:
        "Ahmedabad | Surat | Mumbai | Delhi | Bangalore | Chennai | Kolkata | Hyderabad",
      color: "green",
      action: "View Locations",
      link: "#locations",
      isLocationCard: true,
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      red: {
        bg: "bg-red-50",
        hover: "hover:bg-red-100",
        text: "text-red-600",
        border: "border-red-200",
        iconBg: "bg-red-100",
      },
      blue: {
        bg: "bg-blue-50",
        hover: "hover:bg-blue-100",
        text: "text-blue-600",
        border: "border-blue-200",
        iconBg: "bg-blue-100",
      },
      green: {
        bg: "bg-green-50",
        hover: "hover:bg-green-100",
        text: "text-green-600",
        border: "border-green-200",
        iconBg: "bg-green-100",
      },
    };
    return colors[color] || colors.red;
  };

  // Map Modal Component
  const MapModal = ({ city, onClose }) => {
    if (!city) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {city.name} Office
              </h3>
              <p className="text-sm text-gray-600">{city.address}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
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

          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-600" />
                <span className="text-sm">{city.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-600" />
                <span className="text-sm">{city.email}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <a
                href={`https://www.google.com/maps?q=${city.coordinates}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-center text-sm font-medium transition-colors"
              >
                Open in Google Maps
              </a>
              <a
                href={`tel:${city.phone.replace(/\D/g, "")}`}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-center text-sm font-medium transition-colors"
              >
                Call Office
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Header />

      {/* Map Modal */}
      {showMapModal && (
        <MapModal city={selectedCity} onClose={() => setShowMapModal(false)} />
      )}

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
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

      {/* Contact Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-6">
          {contactCards.map((card, index) => {
            const Icon = card.icon;
            const colors = getColorClasses(card.color);

            return (
              <div
                key={index}
                className={`${colors.bg} rounded-2xl p-8 text-center border ${colors.border} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full ${colors.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {card.title}
                </h3>
                <p className={`${colors.text} font-bold text-lg mb-1`}>
                  {card.primary}
                </p>
                <p className="text-gray-600 text-sm mb-4">{card.secondary}</p>

                {card.isLocationCard ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap justify-center gap-2">
                      {Object.keys(cityLocations).map((cityKey) => (
                        <button
                          key={cityKey}
                          onClick={() => handleCityClick(cityKey)}
                          className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 hover:bg-red-600 hover:text-white transition-colors border border-gray-200"
                        >
                          {cityLocations[cityKey].name}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleCityClick("ahmedabad")}
                      className={`inline-flex items-center gap-2 ${colors.text} hover:underline font-medium mt-2`}
                    >
                      {card.action} →
                    </button>
                  </div>
                ) : (
                  <a
                    href={card.link}
                    className={`inline-flex items-center gap-2 ${colors.text} hover:underline font-medium`}
                  >
                    {card.action} →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Rest of the component remains the same... */}
      {/* Contact Form & Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 px-6">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
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
                    Message Sent Successfully!
                  </p>
                  <p className="text-sm text-green-600">
                    We'll respond within 24 hours.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                      errors.name ? "border-red-500" : "border-gray-300"
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
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                      errors.email ? "border-red-500" : "border-gray-300"
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
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                      errors.phone ? "border-red-500" : "border-gray-300"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="general">General Inquiry</option>
                  <option value="emergency">Emergency Blood Request</option>
                  <option value="donation">Donation Related</option>
                  <option value="camp">Camp Organization</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
                      errors.message ? "border-red-500" : "border-gray-300"
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
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:hover:scale-100"
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
          </div>

          {/* Right Side - Info & FAQ */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Quick Response
              </h3>
              <p className="text-gray-600 mb-4">
                We typically respond within 24 hours. For emergencies, call our
                helpline.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <Phone className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Emergency Helpline
                    </p>
                    <p className="text-red-600 font-bold text-lg">
                      +91 9876543210
                    </p>
                    <p className="text-xs text-gray-500">Available 24/7</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Email Support</p>
                    <p className="text-blue-600">help@bloodconnect.org</p>
                    <p className="text-xs text-gray-500">Response within 24h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Office Hours
              </h3>
              <div className="space-y-2">
                {Object.entries(officeHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{day}</span>
                    <span
                      className={`font-medium ${hours === "Closed" ? "text-red-600" : "text-gray-800"}`}
                    >
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-600" />
                Frequently Asked
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setActiveFaq(activeFaq === index ? null : index)
                      }
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-800">
                        {faq.question}
                      </span>
                      <span className="text-red-600 text-xl">
                        {activeFaq === index ? "−" : "+"}
                      </span>
                    </button>
                    {activeFaq === index && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Connect With Us
              </h3>
              <div className="flex gap-4 justify-center">
                {[
                  {
                    icon: Instagram,
                    color: "hover:bg-pink-600",
                    label: "Instagram",
                    href: "https://instagram.com",
                  },
                  {
                    icon: Facebook,
                    color: "hover:bg-blue-600",
                    label: "Facebook",
                    href: "https://facebook.com",
                  },
                  {
                    icon: Linkedin,
                    color: "hover:bg-blue-700",
                    label: "LinkedIn",
                    href: "https://linkedin.com",
                  },
                  {
                    icon: Globe,
                    color: "hover:bg-red-600",
                    label: "Website",
                    href: "https://bloodconnect.org",
                  },
                ].map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 bg-gray-100 rounded-xl ${social.color} hover:text-white transition-all hover:scale-110`}
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
