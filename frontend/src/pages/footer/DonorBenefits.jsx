// src/pages/footer/DonorBenefits.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import {
  Heart,
  Award,
  Shield,
  Activity,
  Droplet,
  Users,
  Gift,
  Clock,
  TrendingUp,
  Brain,
  Zap,
  Thermometer,
  Scissors,
  BookOpen,
  Calendar,
  Star,
  CheckCircle,
  ChevronRight,
  Flame,
  Sparkles,
  Ambulance,
  Stethoscope,
} from "lucide-react";

const DonorBenefits = () => {
  // Scroll to top on page load
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState("health");

  const healthBenefits = [
    {
      icon: Activity,
      title: "Free Health Check-up",
      description:
        "Get a mini-physical exam including blood pressure, pulse, temperature, and hemoglobin testing before each donation.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      details: [
        "Blood pressure screening",
        "Hemoglobin level check",
        "Pulse rate monitoring",
        "Temperature assessment",
        "Iron level evaluation",
      ],
    },
    {
      icon: Droplet,
      title: "Reduced Iron Levels",
      description:
        "Regular donations help maintain healthy iron levels, reducing the risk of hemochromatosis (iron overload).",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      details: [
        "Prevents iron accumulation",
        "Reduces oxidative stress",
        "Lowers heart disease risk",
        "Improves blood viscosity",
        "Better circulation",
      ],
    },
    {
      icon: Brain,
      title: "Cardiovascular Health",
      description:
        "Regular blood donation may reduce the risk of heart attacks and strokes by improving blood flow.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      details: [
        "Lower blood viscosity",
        "Reduced arterial blockage",
        "Improved blood flow",
        "Lower cholesterol",
        "Reduced heart attack risk",
      ],
    },
    {
      icon: Flame,
      title: "Calorie Burning",
      description:
        "Your body burns approximately 650 calories while replenishing the blood you've donated.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      details: [
        "650 calories burned per donation",
        "Boosts metabolism",
        "Stimulates cell regeneration",
        "Increases energy production",
        "Natural detox process",
      ],
    },
    {
      icon: Shield,
      title: "Immune System Boost",
      description:
        "Blood donation stimulates your body to produce new blood cells, potentially boosting your immune system.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      details: [
        "New blood cell production",
        "Enhanced immune response",
        "Faster cell regeneration",
        "Improved overall health",
        "Natural detoxification",
      ],
    },
    {
      icon: TrendingUp,
      title: "Longevity Benefits",
      description:
        "Studies suggest regular blood donors may live longer due to reduced oxidative stress.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      details: [
        "Reduced oxidative stress",
        "Lower inflammation levels",
        "Better organ function",
        "Increased lifespan potential",
        "Healthier aging process",
      ],
    },
  ];

  const recognitionBenefits = [
    {
      icon: Star,
      title: "Donor Recognition Program",
      description:
        "Earn recognition based on your donation frequency and lifetime contributions.",
      benefits: [
        { tier: "Bronze", donations: "5-10", perks: "Certificate + Badge" },
        {
          tier: "Silver",
          donations: "11-25",
          perks: "Pin + Premium Badge + Certificate",
        },
        {
          tier: "Gold",
          donations: "26-50",
          perks: "Medal + Exclusive Merchandise",
        },
        {
          tier: "Platinum",
          donations: "51-100",
          perks: "Trophy + VIP Event Invites",
        },
        {
          tier: "Diamond",
          donations: "100+",
          perks: "Lifetime Achievement Award",
        },
      ],
    },
    {
      icon: Award,
      title: "Digital Badges & Certificates",
      description:
        "Earn digital badges for your profile and share your achievements on social media.",
      items: [
        "First-time donor badge",
        "Regular donor milestone badges",
        "Emergency response donor badge",
        "Community champion award",
        "Life-saving hero certificate",
      ],
    },
    {
      icon: Gift,
      title: "Exclusive Perks",
      description:
        "Enjoy special offers and discounts from our partner organizations.",
      perks: [
        { name: "Health Insurance Discounts", value: "Up to 15% off" },
        { name: "Gym Membership", value: "20% discount" },
        { name: "Pharmacy Benefits", value: "10% off medicines" },
        { name: "Restaurant Vouchers", value: "Free meal after donation" },
        { name: "Movie Tickets", value: "Buy 1 Get 1 Free" },
      ],
    },
  ];

  const communityBenefits = [
    {
      icon: Users,
      title: "Community Impact",
      description:
        "Join a community of life-savers and make a real difference in people's lives.",
      stats: [
        { value: "1", label: "Donation saves", sublabel: "3 lives" },
        { value: "2M+", label: "Lives saved", sublabel: "by our donors" },
        { value: "500+", label: "Donation camps", sublabel: "nationwide" },
        {
          value: "24/7",
          label: "Emergency support",
          sublabel: "always available",
        },
      ],
    },
    {
      icon: Heart,
      title: "Personal Fulfillment",
      description:
        "Experience the joy of knowing you've helped someone in need.",
      aspects: [
        "Sense of purpose",
        "Community respect",
        "Personal satisfaction",
        "Inspire others to donate",
        "Be part of something bigger",
      ],
    },
    {
      icon: Calendar,
      title: "Special Events",
      description:
        "Get invited to exclusive donor appreciation events and health workshops.",
      events: [
        "Annual Donor Appreciation Gala",
        "Health & Wellness Workshops",
        "Blood Donation Camps",
        "Community Meetups",
        "Volunteer Opportunities",
      ],
    },
  ];

  const emergencyBenefits = [
    {
      icon: Ambulance,
      title: "Priority Emergency Service",
      description:
        "Registered donors get priority access to blood when needed for themselves or family members.",
      features: [
        "Priority blood allocation",
        "Family coverage included",
        "Emergency hotline access",
        "Fast-track processing",
        "Nationwide coverage",
      ],
    },
    {
      icon: Stethoscope,
      title: "Donor Health Program",
      description:
        "Access to special health programs and medical consultations.",
      programs: [
        "Free annual health check-up",
        "Nutrition consultation",
        "Fitness program access",
        "Mental wellness support",
        "Telemedicine benefits",
      ],
    },
    {
      icon: Clock,
      title: "Lifetime Coverage",
      description: "Benefits that grow with your donation history.",
      coverage: [
        "Lifetime health record",
        "Cumulative benefits",
        "Legacy recognition",
        "Family inclusion options",
        "Transferable benefits",
      ],
    },
  ];

  const tabs = [
    { id: "health", label: "Health Benefits", icon: Activity },
    { id: "recognition", label: "Recognition", icon: Award },
    { id: "community", label: "Community", icon: Users },
    { id: "emergency", label: "Emergency Perks", icon: Ambulance },
  ];

  return (
    <>
      <Helmet>
        <title>Blood Donor Benefits | Why Donate Blood | BloodConnect</title>
        <meta
          name="description"
          content="Discover the amazing benefits of becoming a blood donor. From free health check-ups to community recognition and emergency priority services."
        />
        <meta
          name="keywords"
          content="blood donor benefits, why donate blood, donor rewards, health benefits of blood donation"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  More Than Just Saving Lives
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Donor Benefits
              </h1>
              <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
                When you give the gift of life, you receive so much more in
                return. Discover the amazing benefits of being a BloodConnect
                donor.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">3</div>
                  <div className="text-sm text-red-200">
                    Lives Saved per Donation
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">650</div>
                  <div className="text-sm text-red-200">Calories Burned</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">5+</div>
                  <div className="text-sm text-red-200">Health Screenings</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-red-200">Emergency Priority</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-xl p-2 inline-flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-red-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          {/* Health Benefits Tab */}
          {activeTab === "health" && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Health Benefits of Blood Donation
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Donating blood isn't just good for recipients – it's great for
                  you too!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {healthBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                    >
                      <div className={`p-6 bg-gradient-to-r ${benefit.color}`}>
                        <div className="w-16 h-16 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center mb-4">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-white/90 text-sm">
                          {benefit.description}
                        </p>
                      </div>
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Key Benefits:
                        </h4>
                        <ul className="space-y-2">
                          {benefit.details.map((detail, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <span className="text-red-500 font-bold">•</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scientific Evidence */}
              <div className="bg-blue-50 rounded-2xl p-8 mt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Scientific Backing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      28%
                    </div>
                    <p className="text-gray-600">
                      Reduced risk of heart disease in regular donors
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      33%
                    </div>
                    <p className="text-gray-600">
                      Lower chance of suffering a heart attack
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      88%
                    </div>
                    <p className="text-gray-600">
                      Donors report feeling healthier and more energetic
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recognition Benefits Tab */}
          {activeTab === "recognition" && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Donor Recognition Program
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  We celebrate our donors at every milestone. The more you give,
                  the more you receive.
                </p>
              </div>

              {/* Tiers */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Donor Tiers & Rewards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {recognitionBenefits[0].benefits.map((tier, idx) => (
                    <div
                      key={idx}
                      className="text-center p-4 border rounded-xl hover:shadow-lg transition-shadow"
                    >
                      <div
                        className={`text-2xl font-bold mb-2 ${
                          tier.tier === "Bronze"
                            ? "text-amber-600"
                            : tier.tier === "Silver"
                              ? "text-gray-400"
                              : tier.tier === "Gold"
                                ? "text-yellow-500"
                                : tier.tier === "Platinum"
                                  ? "text-blue-500"
                                  : "text-purple-600"
                        }`}
                      >
                        {tier.tier}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {tier.donations} Donations
                      </div>
                      <div className="text-xs text-gray-600">{tier.perks}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Digital Badges
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {recognitionBenefits[1].items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white/70 rounded-lg p-3"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-600" />
                    Exclusive Perks
                  </h3>
                  <div className="space-y-3">
                    {recognitionBenefits[2].perks.map((perk, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-white/70 rounded-lg p-3"
                      >
                        <span className="text-gray-700">{perk.name}</span>
                        <span className="text-red-600 font-semibold text-sm">
                          {perk.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Community Benefits Tab */}
          {activeTab === "community" && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Community & Personal Impact
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Join a community of heroes and experience the joy of giving.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {communityBenefits[0].stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl shadow-lg p-6 text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                      {stat.value}
                    </div>
                    <div className="font-semibold text-gray-800">
                      {stat.label}
                    </div>
                    <div className="text-sm text-gray-500">{stat.sublabel}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Personal Fulfillment
                  </h3>
                  <ul className="space-y-3">
                    {communityBenefits[1].aspects.map((aspect, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{aspect}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Special Events
                  </h3>
                  <ul className="space-y-3">
                    {communityBenefits[2].events.map((event, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">{event}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Testimonials */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6 text-center">
                  What Our Donors Say
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <p className="text-sm mb-4">
                      "Being a donor gives me purpose. I've saved 15 lives and
                      inspired my whole family to donate."
                    </p>
                    <div className="font-semibold">- Michael R.</div>
                    <div className="text-xs text-red-200">
                      Platinum Donor (75 donations)
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <p className="text-sm mb-4">
                      "The health benefits are real! I feel healthier and more
                      energetic since I started donating regularly."
                    </p>
                    <div className="font-semibold">- Sarah K.</div>
                    <div className="text-xs text-red-200">
                      Gold Donor (42 donations)
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <p className="text-sm mb-4">
                      "The community of donors is amazing. We support each other
                      and celebrate every milestone together."
                    </p>
                    <div className="font-semibold">- David M.</div>
                    <div className="text-xs text-red-200">
                      Silver Donor (18 donations)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Benefits Tab */}
          {activeTab === "emergency" && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Emergency & Priority Benefits
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Special privileges when you and your family need blood the
                  most.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {emergencyBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow"
                    >
                      <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                        <Icon className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {benefit.description}
                      </p>
                      <ul className="space-y-2">
                        {(
                          benefit.features ||
                          benefit.programs ||
                          benefit.coverage
                        ).map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <ChevronRight className="w-4 h-4 text-red-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Emergency Card */}
              <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-2xl p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      24/7 Emergency Priority Access
                    </h3>
                    <p className="text-red-200 mb-4">
                      As a registered donor, you and your immediate family get
                      priority access to blood in emergencies.
                    </p>
                    <div className="flex gap-4">
                      <div className="bg-white/20 rounded-lg px-4 py-2">
                        <span className="text-sm">Family Coverage</span>
                        <div className="font-bold">Spouse & Children</div>
                      </div>
                      <div className="bg-white/20 rounded-lg px-4 py-2">
                        <span className="text-sm">Response Time</span>
                        <div className="font-bold">Under 30 mins</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold mb-1">24/7</div>
                    <div className="text-sm text-red-200">
                      Emergency Helpline
                    </div>
                    <div className="text-lg font-bold mt-2">
                      1-800-BLOOD-NOW
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Start Your Donor Journey Today
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of donors who are saving lives while enjoying
              amazing benefits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => (window.location.href = "/register/donor")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Heart className="w-5 h-5" />
                Register as Donor
              </button>
              <button
                onClick={() => (window.location.href = "/eligibility")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <CheckCircle className="w-5 h-5" />
                Check Eligibility
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DonorBenefits;
