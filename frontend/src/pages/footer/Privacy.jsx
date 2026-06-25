import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Printer,
  Share2,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  Server,
  Cookie,
  Shield as ShieldIcon,
  Key,
  Fingerprint,
  Bell,
  Settings,
  Trash2,
  RefreshCw,
  FileCheck,
  Scale,
  Gavel,
  FileSignature,
  Calendar,
  UserCheck,
  AlertTriangle,
  Heart,
  Droplet,
  Building,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../services/api.js";

// Section Component with Expand/Collapse
const PolicySection = ({
  title,
  icon: Icon,
  children,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            {Icon && <Icon className="w-5 h-5 text-red-600" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 text-gray-600 space-y-4">{children}</div>
      )}
    </div>
  );
};

// Data Usage Card
const DataUsageCard = ({ icon: Icon, title, description, examples }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-red-100 rounded-lg">
        {Icon && <Icon className="w-5 h-5 text-red-600" />}
      </div>
      <h4 className="font-medium text-gray-900">{title}</h4>
    </div>
    <p className="text-sm text-gray-600 mb-2">{description}</p>
    <div className="text-xs text-gray-500">
      <span className="font-medium">Examples:</span> {examples}
    </div>
  </div>
);

// Cookie Preference Modal
const CookiePreferences = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    functional: true,
    analytics: false,
    marketing: false,
  });

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    toast.success("Cookie preferences saved!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Cookie className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Cookie Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <AlertCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-gray-600">
            Manage your cookie preferences. Necessary cookies are always enabled
            for basic functionality.
          </p>

          {/* Necessary Cookies */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
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
                  Help us improve our website
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

          {/* Marketing Cookies */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Marketing Cookies
                </h3>
                <p className="text-sm text-gray-600">
                  Used for targeted advertising
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

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
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

// Data Export Modal
const DataExportModal = ({ isOpen, onClose }) => {
  const [exportFormat, setExportFormat] = useState("json");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await userApi.exportData(exportFormat);

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-data.${exportFormat}`;
      a.click();

      toast.success("Data exported successfully!");
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Export Your Data</h3>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600">
            Download a copy of your personal data stored on our platform.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Your data export may contain sensitive information. Keep it
                secure and delete it after use.
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Data
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Data Deletion Modal
const DataDeletionModal = ({ isOpen, onClose }) => {
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmation !== "DELETE MY DATA") {
      toast.error("Please type 'DELETE MY DATA' to confirm");
      return;
    }

    setLoading(true);
    try {
      await userApi.deleteData();

      toast.success(
        "Your data deletion request has been submitted. You will receive a confirmation email.",
      );
      onClose();
    } catch (error) {
      console.error("Deletion error:", error);
      toast.error("Failed to submit deletion request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 text-red-600">
            Delete Your Data
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                This action is irreversible. All your personal data, donation
                history, and account information will be permanently deleted.
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type "DELETE MY DATA" to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="DELETE MY DATA"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Permanently Delete
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Privacy Policy Component
const Privacy = () => {
  const currentYear = new Date().getFullYear();
  const [lastUpdated] = useState(`March 18, ${currentYear}`);
  const [showCookiePrefs, setShowCookiePrefs] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create PDF version (mock)
    toast.success("Privacy policy PDF downloaded");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "LifeDrop Privacy Policy",
          text: "Read our privacy policy to understand how we protect your data",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Header />

      {/* Cookie Preferences Modal */}
      <CookiePreferences
        isOpen={showCookiePrefs}
        onClose={() => setShowCookiePrefs(false)}
      />

      {/* Data Export Modal */}
      <DataExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Data Deletion Modal */}
      <DataDeletionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      {/* Hero Section */}
      <section className="relative pt-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Shield className="w-full h-full" />
        </div>

        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <ShieldIcon className="w-6 h-6" />
              <span className="text-sm font-medium">
                Last Updated: {lastUpdated}
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl opacity-90 mb-8">
              Your privacy is important to us. Learn how we collect, use, and
              protect your data.
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
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                On this page
              </h3>
              <nav className="space-y-2">
                <a
                  href="#introduction"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Introduction
                </a>
                <a
                  href="#data-collection"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Data Collection
                </a>
                <a
                  href="#data-usage"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  How We Use Data
                </a>
                <a
                  href="#data-sharing"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Data Sharing
                </a>
                <a
                  href="#security"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Security Measures
                </a>
                <a
                  href="#your-rights"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Your Rights
                </a>
                <a
                  href="#cookies"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Cookie Policy
                </a>
                <a
                  href="#contact"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Contact Us
                </a>
              </nav>

              {/* User Actions (if authenticated) */}
              {isAuthenticated && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Your Data
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export My Data
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Request Data Deletion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4 space-y-6">
            {/* Introduction */}
            <div id="introduction">
              <PolicySection
                title="Introduction"
                icon={FileText}
                defaultExpanded={true}
              >
                <p>
                  At LifeDrop, we are committed to protecting your privacy
                  and ensuring the security of your personal information. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our blood bank
                  management platform.
                </p>
                <p>
                  We comply with applicable data protection laws, including
                  GDPR, HIPAA, and local healthcare regulations. By using our
                  services, you consent to the practices described in this
                  policy.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      This policy applies to all users of our platform,
                      including donors, recipients, healthcare providers, and
                      hospital partners.
                    </span>
                  </p>
                </div>
              </PolicySection>
            </div>

            {/* Data Collection */}
            <div id="data-collection">
              <PolicySection title="Information We Collect" icon={Database}>
                <p>
                  We collect various types of information to provide and improve
                  our services:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <DataUsageCard
                    icon={UserCheck}
                    title="Personal Information"
                    description="Information that identifies you as an individual"
                    examples="Name, email address, phone number, date of birth, blood type, medical history"
                  />
                  <DataUsageCard
                    icon={Heart}
                    title="Health Information"
                    description="Medical data relevant to blood donation"
                    examples="Blood type, donation history, health screenings, eligibility status"
                  />
                  <DataUsageCard
                    icon={Building}
                    title="Professional Information"
                    description="For healthcare providers and hospitals"
                    examples="License numbers, facility details, staff information, inventory data"
                  />
                  <DataUsageCard
                    icon={Globe}
                    title="Technical Data"
                    description="Information about your device and usage"
                    examples="IP address, browser type, device information, cookies, usage patterns"
                  />
                </div>
              </PolicySection>
            </div>

            {/* Data Usage */}
            <div id="data-usage">
              <PolicySection title="How We Use Your Information" icon={Eye}>
                <p>We use your information for the following purposes:</p>

                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li>
                    <strong>Service Delivery:</strong> To facilitate blood
                    donations, manage requests, and connect donors with
                    recipients
                  </li>
                  <li>
                    <strong>Safety & Compliance:</strong> To verify eligibility,
                    ensure blood safety, and comply with healthcare regulations
                  </li>
                  <li>
                    <strong>Communication:</strong> To send notifications about
                    donation opportunities, emergency requests, and account
                    updates
                  </li>
                  <li>
                    <strong>Improvement:</strong> To analyze usage patterns and
                    improve our platform's functionality
                  </li>
                  <li>
                    <strong>Legal Obligations:</strong> To comply with
                    healthcare reporting requirements and legal requests
                  </li>
                </ul>

                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    We never sell your personal information to third parties.
                  </p>
                </div>
              </PolicySection>
            </div>

            {/* Data Sharing */}
            <div id="data-sharing">
              <PolicySection title="Information Sharing" icon={Users}>
                <p>
                  We may share your information in the following circumstances:
                </p>

                <div className="space-y-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      With Your Consent
                    </h4>
                    <p className="text-sm text-gray-600">
                      When you explicitly agree to share information with
                      hospitals, blood banks, or other users
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Healthcare Partners
                    </h4>
                    <p className="text-sm text-gray-600">
                      With hospitals and blood banks to facilitate donations and
                      emergency requests
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Legal Requirements
                    </h4>
                    <p className="text-sm text-gray-600">
                      When required by law, court order, or government agencies
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Service Providers
                    </h4>
                    <p className="text-sm text-gray-600">
                      With trusted vendors who assist in operating our platform
                      (under strict confidentiality agreements)
                    </p>
                  </div>
                </div>
              </PolicySection>
            </div>

            {/* Security Measures */}
            <div id="security">
              <PolicySection title="Security Measures" icon={Lock}>
                <p>
                  We implement robust security measures to protect your data:
                </p>

                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Lock className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Encryption</h4>
                    <p className="text-xs text-gray-600">
                      256-bit SSL/TLS encryption for all data
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Fingerprint className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">
                      Authentication
                    </h4>
                    <p className="text-xs text-gray-600">
                      Multi-factor authentication available
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Server className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">
                      Secure Servers
                    </h4>
                    <p className="text-xs text-gray-600">
                      HIPAA-compliant data centers
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Regular security audits and penetration testing ensure our
                    systems remain secure.
                  </p>
                </div>
              </PolicySection>
            </div>

            {/* Your Rights */}
            <div id="your-rights">
              <PolicySection title="Your Privacy Rights" icon={Scale}>
                <p>
                  Depending on your location, you may have the following rights:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Right to Access
                      </h4>
                      <p className="text-sm text-gray-600">
                        Request a copy of your personal data
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Right to Rectification
                      </h4>
                      <p className="text-sm text-gray-600">
                        Correct inaccurate information
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Right to Erasure
                      </h4>
                      <p className="text-sm text-gray-600">
                        Request data deletion
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Right to Portability
                      </h4>
                      <p className="text-sm text-gray-600">
                        Receive data in portable format
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Right to Object
                      </h4>
                      <p className="text-sm text-gray-600">
                        Opt-out of certain processing
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Right to Restrict
                      </h4>
                      <p className="text-sm text-gray-600">
                        Limit how we use your data
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons for Authenticated Users */}
                {isAuthenticated && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Request My Data
                    </button>
                    <button
                      onClick={() => navigate("/settings/privacy")}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Privacy Settings
                    </button>
                  </div>
                )}
              </PolicySection>
            </div>

            {/* Cookie Policy */}
            <div id="cookies">
              <PolicySection title="Cookie Policy" icon={Cookie}>
                <p>
                  We use cookies and similar tracking technologies to enhance
                  your experience on our platform. Cookies help us:
                </p>

                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li>Remember your login session</li>
                  <li>Understand how you use our platform</li>
                  <li>Personalize your experience</li>
                  <li>Improve our services</li>
                </ul>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Types of Cookies We Use
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">
                        Essential Cookies:
                      </span>
                      <p className="text-xs text-gray-600">
                        Required for basic platform functionality
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">
                        Functional Cookies:
                      </span>
                      <p className="text-xs text-gray-600">
                        Remember your preferences and settings
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">
                        Analytics Cookies:
                      </span>
                      <p className="text-xs text-gray-600">
                        Help us understand user behavior
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">
                        Marketing Cookies:
                      </span>
                      <p className="text-xs text-gray-600">
                        Used for targeted advertising
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowCookiePrefs(true)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Manage Cookie Preferences
                </button>
              </PolicySection>
            </div>

            {/* Contact Information */}
            <div id="contact">
              <PolicySection title="Contact Us" icon={Mail}>
                <p>
                  If you have questions about this Privacy Policy or how we
                  handle your data, please contact our Data Protection Officer:
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-red-600" />
                    <span>privacy@lifedrop.org</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-red-600" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-red-600" />
                    <span>
                      123 Privacy Street, Data Protection Office, City, State
                      12345
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Response Time:</strong> We typically respond to
                    privacy inquiries within 48 hours.
                  </p>
                </div>
              </PolicySection>
            </div>

            {/* Policy Updates */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Policy Updates
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new policy on
                this page and updating the "Last Updated" date.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">
                    Last Updated: {lastUpdated}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FileCheck className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Version 2.1.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
