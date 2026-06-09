import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  ArrowUp,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { publicApi } from "../services/api.js";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubscribing(true);

    try {
      const response = await publicApi.subscribeNewsletter(email);
      const data = response.data;
      toast.success(data.message || "Successfully subscribed to newsletter!");
      setEmail("");
    } catch (error) {
      console.error("Subscribe error:", error);
      toast.error("Subscription failed. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleSocialClick = (platform, url) => {
    // Track social media clicks (analytics)
    if (typeof window.gtag !== "undefined") {
      window.gtag("event", "social_click", {
        social_platform: platform,
        event_category: "engagement",
        event_label: "footer_social_link",
      });
    }
    window.open(url, "_blank", "noopener noreferrer");
  };

  const handleNavigation = (path, section = null) => {
    navigate(path);
    // Scroll to top when navigating to new page
    window.scrollTo(0, 0);

    // If there's a specific section to scroll to after navigation
    if (section) {
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const quickLinks = [
    { name: "About Us", path: "/about", section: null },
    { name: "Our Mission", path: "/about", section: "mission" }, // Scroll to mission section on about page
    { name: "Success Stories", path: "/success", section: "testimonials" }, // Scroll to testimonials on about page
    { name: "News & Updates", path: "/news", section: null },
    { name: "Blog", path: "/blog", section: null },
  ];

  const donorResources = [
    { name: "Become a Donor", path: "/register/donor", section: null },
    { name: "Eligibility Criteria", path: "/eligibility", section: null },
    { name: "Donation Process", path: "/donation-process", section: null },
    { name: "Donor Benefits", path: "/donor-benefits", section: null },
    { name: "Find Camps", path: "/camps", section: null },
  ];

  const hospitalResources = [
    { name: "Partner with Us", path: "/partner-with-us", section: null },
    { name: "Blood Request", path: "/blood-request", section: null },
    { name: "Inventory Management", path: "/inventory-management", section: null },
    { name: "Emergency Protocol", path: "/emergency-protocol", section: null },
    { name: "FAQs", path: "/faqs", section: null },
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cookie Policy", path: "/cookies" },
    { name: "Sitemap", path: "/sitemap" },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      name: "Facebook",
      url: "https://facebook.com/bloodconnect",
      color: "hover:bg-blue-600",
      handle: "@bloodconnect",
    },
    {
      icon: Twitter,
      name: "Twitter",
      url: "https://twitter.com/bloodconnect",
      color: "hover:bg-sky-500",
      handle: "@bloodconnect",
    },
    {
      icon: Instagram,
      name: "Instagram",
      url: "https://instagram.com/bloodconnect",
      color: "hover:bg-pink-600",
      handle: "@bloodconnect",
    },
    {
      icon: Linkedin,
      name: "LinkedIn",
      url: "https://linkedin.com/company/bloodconnect",
      color: "hover:bg-blue-700",
      handle: "BloodConnect",
    },
  ];

  const contactInfo = [
    {
      icon: Phone,
      text: "1-800-BLOOD-NOW",
      subtext: "24/7 Emergency Helpline",
      action: () => (window.location.href = "tel:18002566369"),
    },
    {
      icon: Mail,
      text: "help@bloodconnect.org",
      subtext: "General Inquiries",
      action: () => (window.location.href = "mailto:help@bloodconnect.org"),
    },
    {
      icon: MapPin,
      text: "Find Blood Banks",
      subtext: "500+ Locations Nationwide",
      action: () => navigate("/camps"),
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-gray-900 text-white relative">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 sm:bottom-24 z-50 p-3 bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-gray-400 mb-6">
              Subscribe to our newsletter for blood donation drives and health
              tips
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={subscribing}
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                {subscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Subscribe
                  </>
                )}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center gap-3 mb-6 group"
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">BloodConnect</h2>
                <p className="text-red-200 text-sm">Life Saver Network</p>
              </div>
            </button>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Connecting compassionate donors with those in need through
              advanced blood bank management technology. Together, we
              save lives and build healthier communities.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3 mb-6">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSocialClick(social.name, social.url)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 ${social.color} transition-all duration-300 hover:scale-110`}
                    aria-label={`Visit our ${social.name} page`}
                    title={`Follow us on ${social.name}`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-300">Verified by Health Ministry</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-red-500 rounded-full"></div>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path, link.section)}
                    className="text-gray-300 hover:text-red-500 hover:underline transition-colors duration-200 flex items-center gap-2 group w-full text-left"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Donors */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-red-500 rounded-full"></div>
              For Donors
            </h3>
            <ul className="space-y-3">
              {donorResources.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path, link.section)}
                    className="text-gray-300 hover:text-red-500 hover:underline transition-colors duration-200 flex items-center gap-2 group w-full text-left"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Hospitals */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
              <div className="w-1 h-5 bg-red-500 rounded-full"></div>
              For Hospitals
            </h3>
            <ul className="space-y-3">
              {hospitalResources.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path, link.section)}
                    className="text-gray-300 hover:text-red-500 hover:underline transition-colors duration-200 flex items-center gap-2 group w-full text-left"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="flex items-center gap-3 text-gray-300 group text-left"
                >
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-red-600 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{item.text}</span>
                    <p className="text-xs text-gray-500">{item.subtext}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="text-gray-400 text-sm">
              © {currentYear} BloodConnect. All rights reserved.
              <span className="mx-2 text-red-500">❤️</span>
              Saving lives through technology.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              {legalLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(link.path)}
                  className="hover:text-white transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Donate Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => handleNavigation("/register/donor")}
          className="flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 hover:from-red-700 hover:to-red-800 group"
        >
          <Heart className="w-5 h-5 group-hover:animate-pulse" />
          <span className="hidden sm:inline">Donate Now</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
