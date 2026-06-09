import React from "react";
import { Helmet } from "react-helmet";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Clock,
  Scale,
  Activity,
  Droplet,
  Shield,
  UserCheck,
} from "lucide-react";

const EligibilityCriteria = () => {
  // Scroll to top on page load
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const eligibilityCriteria = [
    {
      category: "Basic Requirements",
      icon: UserCheck,
      color: "blue",
      criteria: [
        { text: "Age between 18-65 years", met: true },
        { text: "Weight at least 50 kg (110 lbs)", met: true },
        { text: "Good general health", met: true },
        { text: "Valid government ID proof", met: true },
      ],
    },
    {
      category: "Health Conditions",
      icon: Activity,
      color: "green",
      criteria: [
        { text: "Hemoglobin level ≥ 12.5 g/dL", met: true },
        { text: "Blood pressure within normal range", met: true },
        { text: "No cold or flu in past 7 days", met: true },
        { text: "No history of heart disease", met: false },
        { text: "No epilepsy or seizure disorders", met: false },
      ],
    },
    {
      category: "Lifestyle Factors",
      icon: Clock,
      color: "purple",
      criteria: [
        { text: "No alcohol consumption in last 24 hours", met: true },
        { text: "No smoking in last 24 hours", met: true },
        { text: "Adequate sleep (at least 6 hours)", met: true },
        { text: "No high-risk activities in last 4 months", met: false },
      ],
    },
    {
      category: "Medical History",
      icon: Shield,
      color: "orange",
      criteria: [
        { text: "No major surgery in last 6 months", met: true },
        { text: "No blood transfusion in last 6 months", met: true },
        { text: "No vaccination in last 4 weeks", met: false },
        { text: "No chronic illnesses", met: false },
      ],
    },
  ];

  const temporaryDeferrals = [
    {
      condition: "Pregnancy or breastfeeding",
      period: "6 months after delivery/weaning",
    },
    {
      condition: "Recent tattoo or piercing",
      period: "6 months",
    },
    {
      condition: "Dental work (extraction/filling)",
      period: "24-72 hours",
    },
    {
      condition: "Recent travel to malaria-endemic area",
      period: "1-3 years depending on stay",
    },
    {
      condition: "COVID-19 infection",
      period: "14 days after recovery",
    },
    {
      condition: "Recent medication (antibiotics)",
      period: "7 days after completion",
    },
  ];

  const permanentDeferrals = [
    "HIV/AIDS",
    "Hepatitis B or C",
    "Cancer (certain types)",
    "Chronic kidney disease",
    "Severe heart disease",
    "Hemophilia or bleeding disorders",
  ];

  return (
    <>
      <Helmet>
        <title>Blood Donation Eligibility Criteria | BloodConnect</title>
        <meta
          name="description"
          content="Check if you're eligible to donate blood. Learn about age, weight, health conditions, and temporary deferral periods for blood donation."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Blood Donation Eligibility Criteria
              </h1>
              <p className="text-xl text-red-100">
                Your health and safety are our top priorities. Check if you're
                eligible to donate blood and help save lives.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          {/* Quick Eligibility Check */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-800">
                Quick Eligibility Check
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">
                    You CAN donate if:
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-green-700">
                    <span className="text-green-600 font-bold">•</span>
                    You are between 18-65 years old
                  </li>
                  <li className="flex items-start gap-2 text-green-700">
                    <span className="text-green-600 font-bold">•</span>
                    You weigh at least 50 kg (110 lbs)
                  </li>
                  <li className="flex items-start gap-2 text-green-700">
                    <span className="text-green-600 font-bold">•</span>
                    You are feeling healthy and well
                  </li>
                  <li className="flex items-start gap-2 text-green-700">
                    <span className="text-green-600 font-bold">•</span>
                    You haven't donated blood in last 3 months
                  </li>
                </ul>
              </div>
              <div className="bg-red-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-800">
                    You CANNOT donate if:
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-red-700">
                    <span className="text-red-600 font-bold">•</span>
                    You have an active infection or fever
                  </li>
                  <li className="flex items-start gap-2 text-red-700">
                    <span className="text-red-600 font-bold">•</span>
                    You're pregnant or breastfeeding
                  </li>
                  <li className="flex items-start gap-2 text-red-700">
                    <span className="text-red-600 font-bold">•</span>
                    You have chronic medical conditions
                  </li>
                  <li className="flex items-start gap-2 text-red-700">
                    <span className="text-red-600 font-bold">•</span>
                    You had recent surgery or tattoo
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Detailed Criteria Grid */}
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Detailed Eligibility Requirements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {eligibilityCriteria.map((section, idx) => {
              const Icon = section.icon;
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600",
                green: "bg-green-100 text-green-600",
                purple: "bg-purple-100 text-purple-600",
                orange: "bg-orange-100 text-orange-600",
              };

              return (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-3 rounded-lg ${colorClasses[section.color]}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {section.category}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {section.criteria.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2">
                        {item.met ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            item.met ? "text-gray-700" : "text-gray-500"
                          }
                        >
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Temporary Deferrals */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-8 h-8 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-800">
                Temporary Deferral Periods
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              You may be temporarily unable to donate blood under certain
              conditions. Here are common deferral periods:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {temporaryDeferrals.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {item.condition}
                    </p>
                    <p className="text-sm text-gray-600">
                      Deferral period: {item.period}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permanent Deferrals */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Permanent Deferrals
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Some medical conditions permanently prevent blood donation to
              ensure the safety of both donors and recipients:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permanentDeferrals.map((condition, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 bg-red-50 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-800">{condition}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Droplet className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Important Notes
              </h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                Eligibility criteria may vary slightly between different blood
                banks and regions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                Final eligibility determination is made by medical staff at the
                time of donation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                Always disclose complete medical history for your safety and
                recipients' safety
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                Contact your local blood bank for specific questions about your
                eligibility
              </li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Save Lives?
            </h3>
            <p className="text-gray-600 mb-6">
              If you meet the eligibility criteria, register today to become a
              donor
            </p>
            <button
              onClick={() => (window.location.href = "/register/donor")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Heart className="w-5 h-5" />
              Register as Donor
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EligibilityCriteria;
