// src/pages/footer/DonationProcess.jsx
import React from "react";
import { Helmet } from "react-helmet";
import {
  Heart,
  ClipboardList,
  Droplet,
  Activity,
  Coffee,
  Award,
  Clock,
  Shield,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const DonationProcess = () => {
  // Scroll to top on page load
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      number: "01",
      title: "Registration",
      description:
        "Fill out a brief form with your personal details and donor information.",
      icon: ClipboardList,
      color: "from-blue-500 to-blue-600",
      details: [
        "Provide valid ID proof",
        "Complete donor registration form",
        "Receive donor ID card",
      ],
    },
    {
      number: "02",
      title: "Health Screening",
      description:
        "Quick health check to ensure you're eligible to donate today.",
      icon: Activity,
      color: "from-green-500 to-green-600",
      details: [
        "Check hemoglobin levels",
        "Blood pressure measurement",
        "Pulse and temperature check",
      ],
    },
    {
      number: "03",
      title: "Medical History",
      description: "Confidential interview about your health and lifestyle.",
      icon: ClipboardList,
      color: "from-purple-500 to-purple-600",
      details: [
        "Review medical questionnaire",
        "Discuss any health concerns",
        "Confirm eligibility criteria",
      ],
    },
    {
      number: "04",
      title: "Donation",
      description: "The actual blood donation process - quick and safe.",
      icon: Droplet,
      color: "from-red-500 to-red-600",
      details: [
        "Clean and sterilized equipment",
        "Donation takes 8-10 minutes",
        "Approximately 450ml blood collected",
      ],
    },
    {
      number: "05",
      title: "Rest & Refresh",
      description: "Recovery period with refreshments and monitoring.",
      icon: Coffee,
      color: "from-orange-500 to-orange-600",
      details: [
        "Rest for 15-20 minutes",
        "Enjoy light refreshments",
        "Stay hydrated",
      ],
    },
    {
      number: "06",
      title: "Recognition",
      description: "Acknowledgment of your life-saving contribution.",
      icon: Award,
      color: "from-yellow-500 to-yellow-600",
      details: [
        "Receive donor certificate",
        "Track your donation history",
        "Become a regular donor",
      ],
    },
  ];

  const preparationTips = [
    {
      icon: Droplet,
      title: "Hydrate Well",
      description: "Drink plenty of water before donation",
    },
    {
      icon: Coffee,
      title: "Eat Healthy",
      description: "Have a balanced meal 2-3 hours before",
    },
    {
      icon: Heart,
      title: "Rest Well",
      description: "Get adequate sleep the night before",
    },
    {
      icon: Shield,
      title: "Avoid Alcohol",
      description: "No alcohol 24 hours before donation",
    },
  ];

  const aftercareTips = [
    {
      icon: Coffee,
      title: "Drink Fluids",
      description: "Increase fluid intake for 24-48 hours",
    },
    {
      icon: Heart,
      title: "Avoid Strenuous Activity",
      description: "No heavy exercise for 24 hours",
    },
    {
      icon: Activity,
      title: "Keep Bandage On",
      description: "Leave bandage on for 4-6 hours",
    },
    {
      icon: Clock,
      title: "Watch for Symptoms",
      description: "Contact us if feeling unwell",
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          Blood Donation Process | How to Donate Blood | BloodConnect
        </title>
        <meta
          name="description"
          content="Learn about the blood donation process step by step. From registration to recovery, understand what happens during blood donation."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Blood Donation Process
              </h1>
              <p className="text-xl text-red-100">
                Your journey to becoming a life-saver. Here's what to expect
                when you donate blood.
              </p>
            </div>
          </div>
        </div>

        {/* Process Timeline */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Simple 6-Step Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The entire process takes about 60 minutes, but the donation itself
              only takes 8-10 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div
                    className={`bg-gradient-to-r ${step.color} p-6 text-white`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-4xl font-bold opacity-50">
                        {step.number}
                      </span>
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mt-4">{step.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-500"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preparation Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-100 rounded-xl">
                <ClipboardList className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                How to Prepare for Donation
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {preparationTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div key={index} className="text-center group cursor-pointer">
                    <div className="w-20 h-20 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-sm text-gray-500">{tip.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* During Donation */}
          <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-xl">
                <Droplet className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                During the Donation
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  450ml
                </div>
                <p className="text-gray-600">Blood collected per donation</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  8-10min
                </div>
                <p className="text-gray-600">Actual donation time</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-red-600 mb-2">3-4</div>
                <p className="text-gray-600">Lives saved per donation</p>
              </div>
            </div>
          </div>

          {/* Aftercare Section */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-green-100 rounded-xl">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Post-Donation Care
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aftercareTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div key={index} className="text-center group cursor-pointer">
                    <div className="w-20 h-20 mx-auto bg-green-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                      <Icon className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-sm text-gray-500">{tip.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8 bg-gray-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-red-500" />
                  How often can I donate?
                </h3>
                <p className="text-gray-600">
                  You can donate whole blood every 56 days (8 weeks). Platelets
                  can be donated every 7 days, up to 24 times per year.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-red-500" />
                  Is blood donation painful?
                </h3>
                <p className="text-gray-600">
                  You may feel a quick pinch when the needle is inserted, but
                  most donors report minimal discomfort during donation.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-red-500" />
                  How long does it take?
                </h3>
                <p className="text-gray-600">
                  The entire process takes about 60 minutes, including
                  registration, screening, donation, and rest period.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-red-500" />
                  Will I feel weak afterwards?
                </h3>
                <p className="text-gray-600">
                  Most donors feel fine after donation. Your body replaces the
                  fluid within 24 hours and red blood cells within 4-6 weeks.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-8 text-red-100">
              Join thousands of donors saving lives every day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => (window.location.href = "/register/donor")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Heart className="w-5 h-5" />
                Register as Donor
              </button>
              <button
                onClick={() => (window.location.href = "/camps")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <Users className="w-5 h-5" />
                Find Donation Camps
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DonationProcess;
