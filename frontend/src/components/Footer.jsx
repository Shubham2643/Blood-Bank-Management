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
  MessageCircle,
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
      url: "https://www.facebook.com",
      color: "hover:bg-blue-600",
      handle: "lifedrop",
    },
    {
      icon: Twitter,
      name: "Twitter",
      url: "https://twitter.com",
      color: "hover:bg-sky-500",
      handle: "lifedroporg",
    },
    {
      icon: Instagram,
      name: "Instagram",
      url: "https://www.instagram.com",
      color: "hover:bg-pink-600",
      handle: "lifedrop",
    },
    {
      icon: Linkedin,
      name: "LinkedIn",
      url: "https://www.linkedin.com",
      color: "hover:bg-blue-700",
      handle: "lifedrop",
    },
  ];

  const contactInfo = [
    {
      icon: Phone,
      text: "1800-256-6369",
      subtext: "24/7 Emergency Helpline",
      action: () => (window.location.href = "tel:18002566369"),
    },
    {
      icon: Mail,
      text: "help@lifedrop.org",
      subtext: "General Inquiries",
      action: () => (window.location.href = "mailto:help@lifedrop.org"),
    },
    {
      icon: MessageCircle,
      text: "WhatsApp Support",
      subtext: "24/7 Instant Chat Helpline",
      action: () => window.open("https://wa.me/919876543210", "_blank"),
    },
    {
      icon: MapPin,
      text: "Find Blood Banks",
      subtext: "500+ Locations Nationwide",
      action: () => navigate("/camps"),
    },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 relative overflow-hidden">
      {/* Decorative Blur Glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-red-800/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 sm:bottom-24 z-50 p-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full shadow-xl hover:shadow-red-500/20 transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Newsletter Section */}
      <div className="border-b border-slate-900/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-red-500 text-xs font-bold tracking-widest uppercase mb-3 block">Newsletter</span>
            <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white">Stay In The Loop</h3>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto text-sm sm:text-base">
              Subscribe to our newsletter for urgent blood donation drives, health tips, and community stories.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-grow px-5 py-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/60 transition-all backdrop-blur-sm"
                disabled={subscribing}
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-red-800 disabled:to-rose-800 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 hover:shadow-red-500/20 hover:scale-[1.03] active:scale-95 cursor-pointer"
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
            <p className="text-xs text-slate-500 mt-4">
              Zero spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center gap-3.5 mb-6 group text-left"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/20 group-hover:shadow-red-500/35 transition-all group-hover:scale-105 active:scale-95">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">LifeDrop</h2>
                <p className="text-red-400 text-xs font-semibold uppercase tracking-wider">Life Saver Network</p>
              </div>
            </button>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm">
              Connecting compassionate donors with those in need through
              advanced blood bank management technology. Together, we
              save lives and build healthier, stronger communities.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3 mb-8">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                // Custom platform hover styling
                let hoverStyle = "hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400";
                if (social.name === "Facebook") hoverStyle = "hover:bg-blue-600/10 hover:border-blue-500/30 hover:text-blue-400";
                if (social.name === "Twitter") hoverStyle = "hover:bg-sky-500/10 hover:border-sky-400/30 hover:text-sky-400";
                if (social.name === "Instagram") hoverStyle = "hover:bg-pink-600/10 hover:border-pink-500/30 hover:text-pink-400";
                if (social.name === "LinkedIn") hoverStyle = "hover:bg-blue-700/10 hover:border-blue-600/30 hover:text-blue-400";

                return (
                  <button
                    key={index}
                    onClick={() => handleSocialClick(social.name, social.url)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 ${hoverStyle} transition-all duration-300 hover:-translate-y-1 shadow-sm`}
                    aria-label={`Visit our ${social.name} page`}
                    title={`Follow us on ${social.name}`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-green-500/5 border border-green-500/10 text-xs font-semibold text-green-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Verified by Health Ministry</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex flex-col gap-2 mb-6">
              <span>Quick Links</span>
              <span className="w-8 h-[2px] bg-red-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path, link.section)}
                    className="text-slate-400 hover:text-red-400 transition-all duration-300 hover:translate-x-1.5 flex items-center gap-2 group w-full text-left text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Donors */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex flex-col gap-2 mb-6">
              <span>For Donors</span>
              <span className="w-8 h-[2px] bg-red-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {donorResources.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path, link.section)}
                    className="text-slate-400 hover:text-red-400 transition-all duration-300 hover:translate-x-1.5 flex items-center gap-2 group w-full text-left text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Hospitals */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex flex-col gap-2 mb-6">
              <span>For Hospitals</span>
              <span className="w-8 h-[2px] bg-red-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {hospitalResources.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path, link.section)}
                    className="text-slate-400 hover:text-red-400 transition-all duration-300 hover:translate-x-1.5 flex items-center gap-2 group w-full text-left text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="mt-16 pt-10 border-t border-slate-900/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/20 border border-slate-900/60 hover:border-slate-800/60 hover:bg-slate-900/40 hover:-translate-y-1 transition-all duration-300 text-left group w-full shadow-sm"
                >
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-400 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-red-500 group-hover:to-rose-600 group-hover:border-red-400/30 transition-all duration-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{item.text}</span>
                    <p className="text-xs text-slate-500 group-hover:text-slate-400 mt-0.5 transition-colors">{item.subtext}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900/80 bg-slate-950/60 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-slate-500 text-xs sm:text-sm text-center md:text-left">
              © {currentYear} LifeDrop. All rights reserved.
              <span className="mx-2 text-red-500">❤️</span>
              Saving lives through technology.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500">
              {legalLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(link.path)}
                  className="hover:text-white hover:underline transition-colors"
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
          className="flex items-center gap-2 px-5 py-3.5 sm:px-7 sm:py-4.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-full shadow-xl shadow-red-500/10 hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 group cursor-pointer"
        >
          <Heart className="w-5 h-5 group-hover:animate-pulse" />
          <span className="hidden sm:inline">Donate Now</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
