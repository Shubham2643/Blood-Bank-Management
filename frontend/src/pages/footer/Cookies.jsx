import React, { useState, useEffect } from "react";
import {
  Cookie,
  Shield,
  Settings,
  Globe,
  Lock,
  Eye,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Download,
  Printer,
  Share2,
  ChevronDown,
  ChevronUp,
  Sliders,
  PieChart,
  Target,
  Users,
  ShoppingBag,
  FileText,
  RefreshCw,
  Save,
  Trash2,
  HelpCircle,
  Mail,
  Phone,
  Building,
  Calendar,
  Award,
  BarChart3,
  Activity,
  Heart,
  Droplet,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { toast } from "react-hot-toast";

// Cookie Category Card
const CookieCategory = ({
  category,
  icon: Icon,
  description,
  cookies,
  required = false,
  enabled,
  onToggle,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-red-100 rounded-lg">
              {Icon && <Icon className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {category}
                </h3>
                {required && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Required
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{description}</p>

              {/* Cookie count and toggle */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">
                  {cookies.length} cookie{cookies.length !== 1 ? "s" : ""}
                </span>

                {!required ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={onToggle}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                ) : (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Always Active
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Expanded cookie list */}
        {expanded && (
          <div className="mt-4 pl-12">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Cookies in this category:
            </h4>
            <div className="space-y-3">
              {cookies.map((cookie, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {cookie.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {cookie.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Duration: {cookie.duration}
                      </p>
                      <p className="text-xs text-gray-500">
                        Type: {cookie.type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Cookie Consent Banner
const CookieConsentBanner = ({ onAccept, onCustomize }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 animate-slide-up">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Cookie className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                We Value Your Privacy
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              We use cookies to enhance your browsing experience, serve
              personalized content, and analyze our traffic. By clicking "Accept
              All", you consent to our use of cookies. Read our{" "}
              <a href="/cookies" className="text-red-600 hover:underline">
                Cookie Policy
              </a>{" "}
              for more information.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setVisible(false);
                onCustomize?.();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Customize
            </button>
            <button
              onClick={() => {
                setVisible(false);
                onAccept?.("necessary");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Necessary Only
            </button>
            <button
              onClick={() => {
                setVisible(false);
                onAccept?.("all");
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cookie Preferences Modal
const CookiePreferencesModal = ({ isOpen, onClose, onSave }) => {
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
    performance: false,
  });

  if (!isOpen) return null;

  const handleSave = () => {
    // Add timestamp to preferences
    const preferencesWithTimestamp = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify(preferencesWithTimestamp),
    );
    toast.success("Cookie preferences saved!");
    onSave?.(preferences);
    onClose();
  };

  const handleSelectAll = () => {
    setPreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      performance: true,
    });
  };

  const handleDeselectAll = () => {
    setPreferences({
      necessary: true, // Necessary always true
      functional: false,
      analytics: false,
      marketing: false,
      performance: false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Sliders className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Cookie Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-gray-600">
            Manage your cookie preferences. You can choose which categories of
            cookies you want to allow. Necessary cookies are required for basic
            functionality and cannot be disabled.
          </p>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Deselect All
            </button>
          </div>

          {/* Necessary Cookies */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Necessary Cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Required for basic site functionality
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Always Active
              </span>
            </div>
          </div>

          {/* Functional Cookies */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Functional Cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Enable enhanced functionality and personalization
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      functional: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Analytics Cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Help us understand how visitors use our site
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      analytics: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          {/* Performance Cookies */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Performance Cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Help us improve site performance and speed
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.performance}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      performance: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          {/* Marketing Cookies */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Marketing Cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Used for targeted advertising and marketing
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      marketing: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Your cookie preferences will be saved and applied on your next
                visit. You can change them at any time through our Cookie Policy
                page.
              </span>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Preferences
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cookie Table Component
const CookieTable = ({ cookies }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cookie Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Provider
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Purpose
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cookies.map((cookie, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {cookie.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {cookie.provider}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {cookie.purpose}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {cookie.duration}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    cookie.type === "Necessary"
                      ? "bg-green-100 text-green-700"
                      : cookie.type === "Functional"
                        ? "bg-blue-100 text-blue-700"
                        : cookie.type === "Analytics"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {cookie.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main Cookie Policy Component
const Cookies = () => {
  const currentYear = new Date().getFullYear();
  const [lastUpdated] = useState(`March 18, ${currentYear}`);
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
    performance: false,
  });

  useEffect(() => {
    // Check if user has already set preferences
    const savedPrefs = localStorage.getItem("cookiePreferences");
    if (!savedPrefs) {
      setShowConsentBanner(true);
    } else {
      try {
        const parsedPrefs = JSON.parse(savedPrefs);
        // Remove timestamp before setting preferences
        const { timestamp, ...prefsWithoutTimestamp } = parsedPrefs;
        setPreferences(prefsWithoutTimestamp);

        // Optionally use the timestamp
        console.log(
          "Preferences last updated:",
          new Date(timestamp).toLocaleString(),
        );
      } catch (error) {
        console.error("Error parsing saved preferences:", error);
        setShowConsentBanner(true);
      }
    }
  }, []);

  // Cookie data organized by category
  const cookieData = {
    necessary: [
      {
        name: "session_id",
        provider: "BloodConnect",
        purpose: "Maintains user session and authentication state",
        duration: "Session",
        type: "Necessary",
      },
      {
        name: "csrf_token",
        provider: "BloodConnect",
        purpose: "Prevents cross-site request forgery attacks",
        duration: "Session",
        type: "Necessary",
      },
      {
        name: "security_token",
        provider: "BloodConnect",
        purpose: "Ensures secure form submissions",
        duration: "24 hours",
        type: "Necessary",
      },
    ],
    functional: [
      {
        name: "user_preferences",
        provider: "BloodConnect",
        purpose: "Stores user interface preferences and settings",
        duration: "1 year",
        type: "Functional",
      },
      {
        name: "language",
        provider: "BloodConnect",
        purpose: "Remembers your language preference",
        duration: "1 year",
        type: "Functional",
      },
      {
        name: "location",
        provider: "BloodConnect",
        purpose: "Stores your preferred location for nearby camps",
        duration: "30 days",
        type: "Functional",
      },
    ],
    analytics: [
      {
        name: "_ga",
        provider: "Google Analytics",
        purpose: "Distinguishes unique users",
        duration: "2 years",
        type: "Analytics",
      },
      {
        name: "_gid",
        provider: "Google Analytics",
        purpose: "Stores and counts pageviews",
        duration: "24 hours",
        type: "Analytics",
      },
      {
        name: "_gat",
        provider: "Google Analytics",
        purpose: "Throttles request rate",
        duration: "1 minute",
        type: "Analytics",
      },
    ],
    performance: [
      {
        name: "cfduid",
        provider: "Cloudflare",
        purpose: "Identifies trusted web traffic",
        duration: "30 days",
        type: "Performance",
      },
      {
        name: "PERF",
        provider: "BloodConnect",
        purpose: "Monitors site performance metrics",
        duration: "Session",
        type: "Performance",
      },
    ],
    marketing: [
      {
        name: "fbp",
        provider: "Facebook",
        purpose: "Facebook advertising",
        duration: "90 days",
        type: "Marketing",
      },
      {
        name: "ads_prefs",
        provider: "BloodConnect",
        purpose: "Stores advertising preferences",
        duration: "1 year",
        type: "Marketing",
      },
      {
        name: "gclid",
        provider: "Google",
        purpose: "Google Ads tracking",
        duration: "90 days",
        type: "Marketing",
      },
    ],
  };

  const handleAcceptCookies = (type) => {
    let newPrefs;

    if (type === "all") {
      newPrefs = {
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true,
        performance: true,
      };
    } else {
      newPrefs = {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
        performance: false,
      };
    }

    // Add timestamp when saving
    const preferencesWithTimestamp = {
      ...newPrefs,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify(preferencesWithTimestamp),
    );
    setPreferences(newPrefs);
    toast.success("Cookie preferences saved!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Cookie Policy PDF downloaded");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "BloodConnect Cookie Policy",
          text: "Learn about how we use cookies on the BloodConnect platform",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const clearAllCookies = () => {
    // Clear all BloodConnect cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    localStorage.removeItem("cookiePreferences");
    setPreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      performance: false,
    });

    toast.success("All cookies cleared!");
    setShowConsentBanner(true);
  };

  // Helper function to get last updated timestamp
  const getLastUpdatedTimestamp = () => {
    const savedPrefs = localStorage.getItem("cookiePreferences");
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        return parsed.timestamp || null;
      } catch {
        return null;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Header />

      {/* Cookie Consent Banner - only show if showConsentBanner is true */}
      {showConsentBanner && (
        <CookieConsentBanner
          onAccept={(type) => {
            handleAcceptCookies(type);
            setShowConsentBanner(false);
          }}
          onCustomize={() => {
            setShowPreferences(true);
            setShowConsentBanner(false);
          }}
        />
      )}

      {/* Cookie Preferences Modal */}
      <CookiePreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={(prefs) => {
          setPreferences(prefs);
          setShowConsentBanner(false);
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Cookie className="w-full h-full" />
        </div>

        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Cookie className="w-6 h-6" />
              <span className="text-sm font-medium">
                Last Updated: {lastUpdated}
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-xl opacity-90 mb-8">
              Learn about how we use cookies to enhance your experience on our
              blood bank platform.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors ml-auto"
              >
                <Settings className="w-4 h-4" />
                Manage Cookies
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Effective Date: April 1, {currentYear}</span>
              </div>
              <div className="flex items-center gap-1">
                <RefreshCw className="w-4 h-4" />
                <span>Version 1.2.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === "overview"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("cookies")}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === "cookies"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Cookie List
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === "preferences"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Your Preferences
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Introduction */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What Are Cookies?
              </h2>
              <p className="text-gray-600 mb-4">
                Cookies are small text files that are placed on your computer or
                mobile device when you visit a website. They are widely used to
                make websites work more efficiently and provide information to
                the website owners.
              </p>
              <p className="text-gray-600">
                At BloodConnect, we use cookies to enhance your experience,
                remember your preferences, and help us understand how you use
                our platform so we can continuously improve.
              </p>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-4">
              <CookieCategory
                category="Necessary Cookies"
                icon={Lock}
                description="These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and account access."
                cookies={cookieData.necessary}
                required={true}
                enabled={true}
              />

              <CookieCategory
                category="Functional Cookies"
                icon={Settings}
                description="These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers."
                cookies={cookieData.functional}
                enabled={preferences.functional}
                onToggle={() =>
                  setPreferences({
                    ...preferences,
                    functional: !preferences.functional,
                  })
                }
              />

              <CookieCategory
                category="Analytics Cookies"
                icon={BarChart3}
                description="These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously."
                cookies={cookieData.analytics}
                enabled={preferences.analytics}
                onToggle={() =>
                  setPreferences({
                    ...preferences,
                    analytics: !preferences.analytics,
                  })
                }
              />

              <CookieCategory
                category="Performance Cookies"
                icon={Activity}
                description="These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site."
                cookies={cookieData.performance}
                enabled={preferences.performance}
                onToggle={() =>
                  setPreferences({
                    ...preferences,
                    performance: !preferences.performance,
                  })
                }
              />

              <CookieCategory
                category="Marketing Cookies"
                icon={Target}
                description="These cookies track your browsing habits to deliver advertising that is relevant to you and your interests."
                cookies={cookieData.marketing}
                enabled={preferences.marketing}
                onToggle={() =>
                  setPreferences({
                    ...preferences,
                    marketing: !preferences.marketing,
                  })
                }
              />
            </div>

            {/* Third-Party Cookies */}
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Third-Party Cookies
              </h2>
              <p className="text-gray-600 mb-4">
                In addition to our own cookies, we may also use various
                third-party cookies to report usage statistics of the service
                and deliver advertisements on and through the service.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Google Analytics
                  </h3>
                  <p className="text-sm text-gray-600">
                    Used to analyze website traffic and user behavior
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Facebook Pixel
                  </h3>
                  <p className="text-sm text-gray-600">
                    Used for targeted advertising and campaign measurement
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Cloudflare
                  </h3>
                  <p className="text-sm text-gray-600">
                    Used for security and performance optimization
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Hotjar</h3>
                  <p className="text-sm text-gray-600">
                    Used for heatmaps and user behavior analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cookies" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Complete Cookie List
            </h2>

            {/* Cookie Tables by Category */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Necessary Cookies
                </h3>
                <CookieTable cookies={cookieData.necessary} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Functional Cookies
                </h3>
                <CookieTable cookies={cookieData.functional} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Analytics Cookies
                </h3>
                <CookieTable cookies={cookieData.analytics} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Cookies
                </h3>
                <CookieTable cookies={cookieData.performance} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Marketing Cookies
                </h3>
                <CookieTable cookies={cookieData.marketing} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Cookie Preferences
            </h2>

            <div className="space-y-6">
              {/* Current Preferences Summary */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Settings
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div
                      className={`w-3 h-3 rounded-full mx-auto mb-2 ${preferences.necessary ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="text-xs text-gray-600">Necessary</span>
                  </div>
                  <div className="text-center">
                    <div
                      className={`w-3 h-3 rounded-full mx-auto mb-2 ${preferences.functional ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="text-xs text-gray-600">Functional</span>
                  </div>
                  <div className="text-center">
                    <div
                      className={`w-3 h-3 rounded-full mx-auto mb-2 ${preferences.analytics ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="text-xs text-gray-600">Analytics</span>
                  </div>
                  <div className="text-center">
                    <div
                      className={`w-3 h-3 rounded-full mx-auto mb-2 ${preferences.performance ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="text-xs text-gray-600">Performance</span>
                  </div>
                  <div className="text-center">
                    <div
                      className={`w-3 h-3 rounded-full mx-auto mb-2 ${preferences.marketing ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="text-xs text-gray-600">Marketing</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Modify Preferences
                </button>

                <button
                  onClick={clearAllCookies}
                  className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Cookies
                </button>
              </div>

              {/* Last Updated */}
              <p className="text-sm text-gray-500">
                Preferences last updated:{" "}
                {getLastUpdatedTimestamp()
                  ? new Date(getLastUpdatedTimestamp()).toLocaleString()
                  : "Not set"}
              </p>

              {/* Information */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700 flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Changes to your cookie preferences will be applied on your
                    next visit. Some features may not function properly if you
                    disable certain cookie categories.
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-8 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <HelpCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Questions About Cookies?
              </h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about our use of cookies, please
                contact our privacy team.
              </p>
              <div className="flex flex-wrap gap-6">
                <a
                  href="mailto:privacy@bloodconnect.org"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Mail className="w-4 h-4" />
                  cookie@bloodconnect.org
                </a>
                <a
                  href="tel:+15551234567"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Phone className="w-4 h-4" />
                  +91 9876543210
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cookies;
