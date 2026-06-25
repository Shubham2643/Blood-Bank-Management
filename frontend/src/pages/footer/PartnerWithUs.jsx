// src/pages/footer/PartnerWithUs.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Building2,
  Hospital,
  Microscope,
  Truck,
  Heart,
  Handshake,
  Award,
  Users,
  TrendingUp,
  Shield,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  ArrowRight,
  FileText,
  Calendar,
  Star,
  Target,
  Zap,
  Activity,
  Droplet,
  Settings,
  BarChart3,
  MessageCircle,
  Send,
  Loader2,
  X,
  ChevronRight,
  Briefcase,
  Home,
  Store,
  School,
  Church,
  Building,
  Factory,
  UserPlus,
  DollarSign,
  Percent,
  Gift,
  ThumbsUp,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";

const PartnerWithUs = () => {
  const navigate = useNavigate();
  const [selectedPartnership, setSelectedPartnership] = useState("hospital");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Scroll to top on page load
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Partnership types
  const partnershipTypes = [
    {
      id: "hospital",
      title: "Hospitals & Healthcare",
      icon: Hospital,
      color: "from-red-500 to-red-600",
      description:
        "Partner with us for seamless blood inventory management and emergency blood requests.",
      benefits: [
        "Real-time blood inventory tracking",
        "Emergency blood request system",
        "Direct donor communication",
        "Inventory analytics and reports",
        "Priority blood allocation",
        "Staff training and support",
      ],
      requirements: [
        "Valid hospital registration",
        "Licensed blood storage facility",
        "Trained medical staff",
        "Quality control protocols",
      ],
      stats: {
        partners: "150+",
        hospitals: "85+",
        bloodUnits: "50K+",
      },
    },
    {
      id: "bloodBank",
      title: "Blood Banks",
      icon: Droplet,
      color: "from-red-600 to-red-700",
      description:
        "Connect your blood bank to our network and expand your reach to more donors and hospitals.",
      benefits: [
        "Centralized inventory management",
        "Donor management system",
        "Cross-bank blood transfer",
        "Expiry tracking alerts",
        "Compliance reporting",
        "Mobile app integration",
      ],
      requirements: [
        "Government/Licensed blood bank",
        "Proper storage facilities",
        "Qualified technicians",
        "Regular quality audits",
      ],
      stats: {
        partners: "75+",
        bloodBanks: "45+",
        donors: "100K+",
      },
    },
    {
      id: "corporate",
      title: "Corporate Partners",
      icon: Briefcase,
      color: "from-orange-500 to-orange-600",
      description:
        "Organize corporate blood donation camps and fulfill your CSR objectives.",
      benefits: [
        "On-site blood donation camps",
        "CSR recognition and certificate",
        "Employee health programs",
        "Brand visibility",
        "Team building activities",
        "Tax benefits under CSR",
      ],
      requirements: [
        "Registered company/org",
        "Minimum 100 employees",
        "Space for donation camp",
        "CSR committee approval",
      ],
      stats: {
        partners: "200+",
        companies: "120+",
        employees: "50K+",
      },
    },
    {
      id: "educational",
      title: "Educational Institutions",
      icon: School,
      color: "from-green-500 to-green-600",
      description:
        "Partner with us to conduct blood donation drives and educate students about blood donation.",
      benefits: [
        "Campus blood donation camps",
        "Student volunteer programs",
        "Educational workshops",
        "Leadership opportunities",
        "Community service hours",
        "Recognition certificates",
      ],
      requirements: [
        "School/College/University",
        "Student body approval",
        "Campus facilities",
        "Facility coordinator",
      ],
      stats: {
        partners: "300+",
        colleges: "180+",
        students: "100K+",
      },
    },
    {
      id: "community",
      title: "Community Organizations",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      description:
        "Join hands with us to organize community blood drives and raise awareness.",
      benefits: [
        "Community blood drives",
        "Awareness campaigns",
        "Volunteer network",
        "Local impact tracking",
        "Event support",
        "Recognition awards",
      ],
      requirements: [
        "Registered NGO/Society",
        "Active community presence",
        "Volunteer network",
        "Local partnerships",
      ],
      stats: {
        partners: "400+",
        ngos: "250+",
        volunteers: "25K+",
      },
    },
    {
      id: "government",
      title: "Government Agencies",
      icon: Building,
      color: "from-blue-500 to-blue-600",
      description:
        "Collaborate with us on public health initiatives and national blood donation campaigns.",
      benefits: [
        "Public health campaigns",
        "Data sharing and analytics",
        "Policy implementation",
        "Emergency preparedness",
        "National registry access",
        "Grant opportunities",
      ],
      requirements: [
        "Government authorization",
        "Clearance certificates",
        "Compliance standards",
        "MOU agreement",
      ],
      stats: {
        partners: "25+",
        agencies: "15+",
        campaigns: "50+",
      },
    },
  ];

  // Success stories
  const successStories = [
    {
      name: "City General Hospital",
      type: "Hospital",
      image:
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      quote:
        "LifeDrop has transformed our blood inventory management. We've reduced wastage by 40% and never faced a blood shortage since partnering.",
      impact: "500+ lives saved annually",
      since: "2022",
    },
    {
      name: "TechMahindra Foundation",
      type: "Corporate",
      image: "/techmahindra_foundation.png",
      quote:
        "Our employees love the blood donation camps organized through LifeDrop. It's become our flagship CSR initiative.",
      impact: "1000+ units collected",
      since: "2021",
    },
    {
      name: "Delhi University",
      type: "Educational",
      image: "/delhi_university.png",
      quote:
        "The student response has been overwhelming. LifeDrop makes it easy to organize camps and track donations.",
      impact: "2000+ student donors",
      since: "2023",
    },
  ];

  // Partnership tiers
  const partnershipTiers = [
    {
      name: "Basic Partner",
      price: "Free",
      features: [
        "Basic inventory tracking",
        "Blood request posting",
        "Email support",
        "Monthly reports",
      ],
      icon: Heart,
      color: "gray",
    },
    {
      name: "Premium Partner",
      price: "Custom",
      features: [
        "Advanced analytics",
        "Priority support 24/7",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Training sessions",
      ],
      icon: Star,
      color: "gold",
      recommended: true,
    },
    {
      name: "Enterprise Partner",
      price: "Custom",
      features: [
        "All Premium features",
        "Multi-location management",
        "White-label solution",
        "SLA guarantee",
        "Strategic partnership",
        "Co-branded campaigns",
      ],
      icon: Award,
      color: "platinum",
    },
  ];

  // Form state
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    contactPerson: "",
    designation: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    website: "",
    partnershipType: "hospital",
    employeeCount: "",
    experience: "",
    message: "",
    agreeTerms: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.organizationName ||
      !formData.contactPerson ||
      !formData.email ||
      !formData.phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        "Partnership request submitted successfully! Our team will contact you within 48 hours.",
      );
      setShowForm(false);
      navigate("/");
      setFormData({
        organizationName: "",
        organizationType: "",
        contactPerson: "",
        designation: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        website: "",
        partnershipType: "hospital",
        employeeCount: "",
        experience: "",
        message: "",
        agreeTerms: false,
      });
    } catch (error) {
      toast.error("Submission failed. Please try again.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const currentPartnership = partnershipTypes.find(
    (p) => p.id === selectedPartnership,
  );
  const Icon = currentPartnership?.icon || Hospital;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>
          Partner with LifeDrop | Join Our Mission to Save Lives
        </title>
        <meta
          name="description"
          content="Partner with LifeDrop to enhance blood donation and management. Join hospitals, blood banks, corporates, and NGOs in our life-saving mission."
        />
      </Helmet>
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden pt-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Handshake className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Join Our Network of Life-Savers
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Partner with LifeDrop
              </h1>
              <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
                Together, we can build a robust blood donation ecosystem.
                Partner with us to save more lives and strengthen healthcare
                infrastructure.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-8 py-4 bg-white text-red-600 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Handshake className="w-5 h-5" />
                  Become a Partner
                </button>
                <button
                  onClick={() => {
                    const element =
                      document.getElementById("partnership-types");
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                >
                  <Info className="w-5 h-5" />
                  Explore Partnerships
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                <div>
                  <div className="text-4xl font-bold mb-1">1150+</div>
                  <div className="text-sm text-red-200">Total Partners</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-1">500+</div>
                  <div className="text-sm text-red-200">Hospitals</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-1">250+</div>
                  <div className="text-sm text-red-200">Blood Banks</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-1">400+</div>
                  <div className="text-sm text-red-200">Organizations</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Partner With Us */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Partner with LifeDrop?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join India's fastest-growing blood donation network and make a
              lasting impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-red-600 transition-colors">
                <Target className="w-10 h-10 text-red-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Wider Reach
              </h3>
              <p className="text-gray-600">
                Connect with thousands of verified donors across the country
                through our platform
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-red-600 transition-colors">
                <Zap className="w-10 h-10 text-red-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Real-time Updates
              </h3>
              <p className="text-gray-600">
                Instant notifications for blood requests and inventory
                management
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-red-600 transition-colors">
                <BarChart3 className="w-10 h-10 text-red-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Analytics & Insights
              </h3>
              <p className="text-gray-600">
                Comprehensive reports and analytics to optimize your blood
                management
              </p>
            </div>
          </div>
        </div>

        {/* Partnership Types */}
        <div id="partnership-types" className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Choose Your Partnership Type
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Select the partnership model that best fits your organization
              </p>
            </div>

            {/* Partnership Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {partnershipTypes.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedPartnership(type.id)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                      selectedPartnership === type.id
                        ? `bg-gradient-to-r ${type.color} text-white shadow-lg scale-105`
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <TypeIcon className="w-5 h-5" />
                    {type.title}
                  </button>
                );
              })}
            </div>

            {/* Selected Partnership Details */}
            {currentPartnership && (
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${currentPartnership.color} px-8 py-6 text-white`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">
                        {currentPartnership.title}
                      </h3>
                      <p className="text-white/90">
                        {currentPartnership.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Benefits */}
                    <div className="md:col-span-2">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-red-600" />
                        Key Benefits
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentPartnership.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements & Stats */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-600" />
                        Requirements
                      </h4>
                      <ul className="space-y-2 mb-6">
                        {currentPartnership.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">•</span>
                            <span className="text-gray-600 text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <h5 className="font-semibold text-gray-800 mb-3">
                          Impact Stats
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Partners
                            </span>
                            <span className="font-bold text-red-600">
                              {currentPartnership.stats.partners}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Active
                            </span>
                            <span className="font-bold text-red-600">
                              {currentPartnership.stats.hospitals ||
                                currentPartnership.stats.bloodBanks ||
                                currentPartnership.stats.companies ||
                                currentPartnership.stats.colleges ||
                                currentPartnership.stats.ngos ||
                                currentPartnership.stats.agencies}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Lives Impacted
                            </span>
                            <span className="font-bold text-red-600">
                              {currentPartnership.stats.bloodUnits ||
                                currentPartnership.stats.donors ||
                                currentPartnership.stats.employees ||
                                currentPartnership.stats.students ||
                                currentPartnership.stats.volunteers ||
                                currentPartnership.stats.campaigns}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-lg font-semibold inline-flex items-center gap-2"
                    >
                      <Handshake className="w-5 h-5" />
                      Apply for {currentPartnership.title} Partnership
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Partnership Tiers */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Partnership Tiers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the level of partnership that suits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {partnershipTiers.map((tier, idx) => {
              const TierIcon = tier.icon;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl shadow-xl overflow-hidden relative ${
                    tier.recommended ? "ring-2 ring-red-500 scale-105" : ""
                  }`}
                >
                  {tier.recommended && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Recommended
                    </div>
                  )}
                  <div
                    className={`p-6 text-center ${
                      tier.color === "gold"
                        ? "bg-gradient-to-b from-yellow-400 to-yellow-500"
                        : tier.color === "platinum"
                          ? "bg-gradient-to-b from-gray-400 to-gray-500"
                          : "bg-gradient-to-b from-gray-200 to-gray-300"
                    }`}
                  >
                    <TierIcon
                      className={`w-12 h-12 mx-auto mb-3 ${
                        tier.color === "gold"
                          ? "text-white"
                          : tier.color === "platinum"
                            ? "text-white"
                            : "text-gray-700"
                      }`}
                    />
                    <h3 className="text-xl font-bold text-gray-800">
                      {tier.name}
                    </h3>
                    <p className="text-2xl font-bold mt-2">{tier.price}</p>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {tier.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full mt-6 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Success Stories */}
        <div className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Partner Success Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                See how our partners are making a difference
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {successStories.map((story, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        {story.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        Since {story.since}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {story.name}
                    </h3>
                    <p className="text-gray-600 mb-4 italic">"{story.quote}"</p>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Activity className="w-4 h-4" />
                      <span className="font-medium">{story.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-600" />
                  What is the process to become a partner?
                </h3>
                <p className="text-gray-600 text-sm">
                  Simply fill out the partnership application form. Our team
                  will review your application and contact you within 48 hours
                  to discuss next steps and customize a partnership plan.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-600" />
                  Is there any partnership fee?
                </h3>
                <p className="text-gray-600 text-sm">
                  Basic partnership is free. Premium and Enterprise tiers have
                  customized pricing based on your requirements and scale of
                  operations.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-600" />
                  How long does the onboarding take?
                </h3>
                <p className="text-gray-600 text-sm">
                  Onboarding typically takes 1-2 weeks, including documentation,
                  integration (if applicable), and training for your team.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Join Our Mission?
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Take the first step towards saving more lives. Partner with us
              today.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-white text-red-600 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg font-semibold inline-flex items-center gap-2"
            >
              <Handshake className="w-5 h-5" />
              Become a Partner Now
            </button>
          </div>
        </div>

        {/* Partnership Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Partnership Application
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Fill in your details and we'll get back to you
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Type *
                      </label>
                      <select
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="hospital">Hospital</option>
                        <option value="bloodBank">Blood Bank</option>
                        <option value="corporate">Corporate</option>
                        <option value="educational">
                          Educational Institution
                        </option>
                        <option value="ngo">
                          NGO / Community Organization
                        </option>
                        <option value="government">Government Agency</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Partnership Type *
                      </label>
                      <select
                        name="partnershipType"
                        value={formData.partnershipType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        {partnershipTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
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
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Employees
                      </label>
                      <input
                        type="number"
                        name="employeeCount"
                        value={formData.employeeCount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Tell us more about your organization and partnership goals..."
                      ></textarea>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="agreeTerms"
                          checked={formData.agreeTerms}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          required
                        />
                        <span className="text-sm text-gray-700">
                          I agree to the terms and conditions and consent to
                          LifeDrop contacting me regarding this partnership
                          inquiry. *
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Application
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
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
      </main>
      <Footer />
    </div>
  );
};

export default PartnerWithUs;
