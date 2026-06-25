import React, { useState } from "react";
import {
  FileText,
  Scale,
  Gavel,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  Users,
  Heart,
  Droplet,
  Clock,
  Mail,
  Phone,
  Building,
  Download,
  Printer,
  Share2,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileSignature,
  Ban,
  Flag,
  HelpCircle,
  Award,
  Lock,
  Globe,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Terms Section Component
const TermsSection = ({
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

// User Type Specific Terms
const UserTypeTerms = ({ type, icon: Icon, color, terms }) => (
  <div className={`bg-${color}-50 p-4 rounded-lg border border-${color}-200`}>
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className={`w-5 h-5 text-${color}-600`} />}
      <h4 className={`font-semibold text-${color}-800`}>{type} Terms</h4>
    </div>
    <ul className="space-y-2">
      {terms.map((term, index) => (
        <li key={index} className="flex items-start gap-2 text-sm">
          <CheckCircle
            className={`w-4 h-4 text-${color}-500 flex-shrink-0 mt-0.5`}
          />
          <span className="text-gray-700">{term}</span>
        </li>
      ))}
    </ul>
  </div>
);

// Agreement Modal
const AgreementModal = ({ isOpen, onClose, onAccept }) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (!agreed) {
      toast.error("Please confirm that you have read and agree to the terms");
      return;
    }

    // Store acceptance in localStorage
    localStorage.setItem("termsAccepted", new Date().toISOString());
    localStorage.setItem("termsVersion", "2.1.0");

    toast.success("Terms accepted successfully!");
    onAccept?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileSignature className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Accept Terms of Service
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
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Please read these terms carefully before accepting. They contain
                important information about your rights and obligations.
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              Summary of Key Terms
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  You must be 18 or older to use our services
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  Provide accurate and truthful information
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  Follow all safety and medical guidelines
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  Respect other users and their privacy
                </span>
              </li>
            </ul>
          </div>

          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">
              I have read, understood, and agree to be bound by the Terms of
              Service
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Accept Terms
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Terms of Service Component
const Terms = () => {
  const [lastUpdated] = useState("March 15, 2025");
  const [effectiveDate] = useState("April 1, 2025");
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Terms of Service PDF downloaded");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "LifeDrop Terms of Service",
          text: "Review our terms of service for using the LifeDrop platform",
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

  const handleAcceptTerms = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to accept terms");
      navigate("/login");
      return;
    }
    setShowAgreementModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Header />

      {/* Agreement Modal */}
      <AgreementModal
        isOpen={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
        onAccept={() => {
          // Redirect to dashboard or appropriate page
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            const role = user?.role;
            if (role) {
              navigate(`/${role}`);
            } else {
              navigate("/dashboard");
            }
          }
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Scale className="w-full h-full" />
        </div>

        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Gavel className="w-6 h-6" />
              <span className="text-sm font-medium">
                Last Updated: {lastUpdated}
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl opacity-90 mb-8">
              Please read these terms carefully before using our blood bank
              management platform.
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
                onClick={handleAcceptTerms}
                className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors ml-auto"
              >
                <FileSignature className="w-4 h-4" />
                Accept Terms
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Effective Date: {effectiveDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>Version 2.1.0</span>
              </div>
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
                Quick Navigation
              </h3>
              <nav className="space-y-2">
                <a
                  href="#agreement"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Agreement to Terms
                </a>
                <a
                  href="#eligibility"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Eligibility
                </a>
                <a
                  href="#user-responsibilities"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  User Responsibilities
                </a>
                <a
                  href="#user-types"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  User Type Terms
                </a>
                <a
                  href="#prohibited"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Prohibited Activities
                </a>
                <a
                  href="#medical"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Medical Terms
                </a>
                <a
                  href="#liability"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Limitation of Liability
                </a>
                <a
                  href="#termination"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Termination
                </a>
                <a
                  href="#governing-law"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Governing Law
                </a>
                <a
                  href="#contact"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Contact Us
                </a>
              </nav>

              {/* Quick Accept */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleAcceptTerms}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Accept Terms
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4 space-y-6">
            {/* Agreement to Terms */}
            <div id="agreement">
              <TermsSection
                title="Agreement to Terms"
                icon={FileSignature}
                defaultExpanded={true}
              >
                <p>
                  By accessing or using the LifeDrop platform, you agree to
                  be bound by these Terms of Service and all applicable laws and
                  regulations. If you do not agree with any part of these terms,
                  you may not use our services.
                </p>
                <p>
                  These terms constitute a legally binding agreement between you
                  and LifeDrop regarding your use of the platform.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    By creating an account or using our services, you
                    acknowledge that you have read, understood, and agree to be
                    bound by these terms.
                  </p>
                </div>
              </TermsSection>
            </div>

            {/* Eligibility */}
            <div id="eligibility">
              <TermsSection title="Eligibility" icon={UserCheck}>
                <p>To use our services, you must:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Be at least 18 years of age (or 16 with parental consent for
                    donors)
                  </li>
                  <li>
                    Have the legal capacity to enter into binding contracts
                  </li>
                  <li>
                    Provide accurate and complete registration information
                  </li>
                  <li>
                    Not be barred from using services under applicable law
                  </li>
                  <li>
                    Meet medical eligibility requirements for blood donation
                  </li>
                </ul>
              </TermsSection>
            </div>

            {/* User Responsibilities */}
            <div id="user-responsibilities">
              <TermsSection title="User Responsibilities" icon={Users}>
                <p>As a user of our platform, you agree to:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Provide truthful and accurate information about yourself
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Maintain the confidentiality of your account credentials
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Notify us immediately of any unauthorized account use
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Comply with all applicable laws and regulations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Respect the rights and privacy of other users</span>
                  </li>
                </ul>
              </TermsSection>
            </div>

            {/* User Type Specific Terms */}
            <div id="user-types">
              <TermsSection title="Terms by User Type" icon={Users}>
                <p className="mb-4">
                  Different terms may apply depending on your role on our
                  platform:
                </p>

                <div className="space-y-4">
                  <UserTypeTerms
                    type="Donors"
                    icon={Heart}
                    color="red"
                    terms={[
                      "Must meet medical eligibility criteria for blood donation",
                      "Provide accurate health information and medical history",
                      "Follow pre and post-donation guidelines",
                      "Not donate blood if medically ineligible",
                      "Respect appointment times and camp schedules",
                    ]}
                  />

                  <UserTypeTerms
                    type="Recipients / Patients"
                    icon={Droplet}
                    color="blue"
                    terms={[
                      "Provide accurate medical information and blood type",
                      "Use requested blood only for intended medical purposes",
                      "Respect the voluntary nature of blood donation",
                      "Follow hospital protocols for blood transfusion",
                      "Provide feedback on donation experience",
                    ]}
                  />

                  <UserTypeTerms
                    type="Hospitals"
                    icon={Building}
                    color="green"
                    terms={[
                      "Maintain valid medical licenses and certifications",
                      "Follow proper blood storage and handling protocols",
                      "Report adverse reactions promptly",
                      "Maintain accurate inventory records",
                      "Comply with all healthcare regulations",
                    ]}
                  />

                  <UserTypeTerms
                    type="Blood Labs"
                    icon={Shield}
                    color="purple"
                    terms={[
                      "Maintain proper testing and storage facilities",
                      "Follow standard operating procedures for blood testing",
                      "Report test results accurately and timely",
                      "Maintain quality control standards",
                      "Comply with laboratory regulations",
                    ]}
                  />
                </div>
              </TermsSection>
            </div>

            {/* Prohibited Activities */}
            <div id="prohibited">
              <TermsSection title="Prohibited Activities" icon={Ban}>
                <p>The following activities are strictly prohibited:</p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Fraudulent Information
                      </h4>
                      <p className="text-sm text-gray-600">
                        Providing false or misleading information
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Unauthorized Access
                      </h4>
                      <p className="text-sm text-gray-600">
                        Accessing other users' accounts without permission
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Commercial Use
                      </h4>
                      <p className="text-sm text-gray-600">
                        Using the platform for commercial purposes without
                        authorization
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Harassment</h4>
                      <p className="text-sm text-gray-600">
                        Harassing, threatening, or intimidating other users
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Data Mining</h4>
                      <p className="text-sm text-gray-600">
                        Extracting data without authorization
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Malicious Code
                      </h4>
                      <p className="text-sm text-gray-600">
                        Uploading viruses or harmful code
                      </p>
                    </div>
                  </div>
                </div>
              </TermsSection>
            </div>

            {/* Medical Terms */}
            <div id="medical">
              <TermsSection title="Medical Terms and Disclaimers" icon={Heart}>
                <div className="space-y-4">
                  <p>
                    <strong>No Medical Advice:</strong> LifeDrop does not
                    provide medical advice. All medical decisions should be made
                    in consultation with qualified healthcare professionals.
                  </p>

                  <p>
                    <strong>Health Screening:</strong> Donors must undergo
                    health screening before each donation. We reserve the right
                    to defer donors based on medical criteria.
                  </p>

                  <p>
                    <strong>Blood Safety:</strong> All donated blood is tested
                    for infectious diseases. Donors must provide accurate health
                    information to ensure blood safety.
                  </p>

                  <p>
                    <strong>Emergency Situations:</strong> In emergencies, we
                    prioritize critical needs but cannot guarantee immediate
                    availability of blood products.
                  </p>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      LifeDrop is not a medical facility and does not
                      provide medical treatment. Always seek medical attention
                      in emergencies.
                    </p>
                  </div>
                </div>
              </TermsSection>
            </div>

            {/* Limitation of Liability */}
            <div id="liability">
              <TermsSection title="Limitation of Liability" icon={Shield}>
                <p>
                  To the maximum extent permitted by law, LifeDrop shall not
                  be liable for:
                </p>

                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li>Any indirect, incidental, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>
                    Damages resulting from use or inability to use our services
                  </li>
                  <li>Unauthorized access to or alteration of your data</li>
                  <li>
                    Statements or conduct of any third party on the platform
                  </li>
                </ul>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Some jurisdictions do not allow the
                    exclusion of certain warranties or limitations of liability,
                    so the above limitations may not apply to you.
                  </p>
                </div>
              </TermsSection>
            </div>

            {/* Termination */}
            <div id="termination">
              <TermsSection title="Termination" icon={XCircle}>
                <p>
                  We may terminate or suspend your account and access to
                  services immediately, without prior notice, for:
                </p>

                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li>Violation of these Terms of Service</li>
                  <li>Fraudulent or illegal activities</li>
                  <li>Harassment or harm to other users</li>
                  <li>Extended periods of inactivity</li>
                  <li>Upon your request</li>
                </ul>

                <p className="mt-4">
                  Upon termination, your right to use the services will
                  immediately cease. Provisions that by their nature should
                  survive termination shall survive.
                </p>
              </TermsSection>
            </div>

            {/* Governing Law */}
            <div id="governing-law">
              <TermsSection title="Governing Law" icon={Gavel}>
                <p>
                  These Terms shall be governed by and construed in accordance
                  with the laws of the State of [Your State], without regard to
                  its conflict of law provisions.
                </p>

                <p className="mt-4">
                  Any legal disputes arising from these terms shall be resolved
                  exclusively in the courts of [Your City, Your State].
                </p>
              </TermsSection>
            </div>

            {/* Contact Information */}
            <div id="contact">
              <TermsSection title="Contact Us" icon={Mail}>
                <p>
                  If you have questions about these Terms of Service, please
                  contact us:
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-red-600" />
                    <a
                      href="mailto:legal@lifedrop.org"
                      className="hover:text-red-600"
                    >
                      legal@lifedrop.org
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-red-600" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-red-600" />
                    <span>123 Legal Avenue, Suite 100, City, State 12345</span>
                  </div>
                </div>
              </TermsSection>
            </div>

            {/* Acceptance Summary */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-8 text-center">
              <FileSignature className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                Ready to Accept the Terms?
              </h3>
              <p className="mb-6 opacity-90">
                By accepting these terms, you agree to use our platform
                responsibly and help us save lives through blood donation.
              </p>
              <button
                onClick={handleAcceptTerms}
                className="bg-white text-red-600 px-8 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors"
              >
                I Accept the Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
