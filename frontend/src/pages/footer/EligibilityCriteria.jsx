import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
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
  Search,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Sparkles,
} from "lucide-react";

const EligibilityCriteria = () => {
  const navigate = useNavigate();
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State management
  const [activeTab, setActiveTab] = useState("quiz");
  const [searchTerm, setSearchTerm] = useState("");
  const [quizAnswers, setQuizAnswers] = useState({
    age: "",
    weight: "",
    lastDonation: "",
    healthy: "",
    pregnant: "",
  });
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const eligibilityCriteria = [
    {
      category: "Basic Requirements",
      icon: UserCheck,
      color: "blue",
      description: "Minimum physical thresholds for blood donation",
      criteria: [
        { text: "Age between 18-65 years", met: true },
        { text: "Weight at least 50 kg (110 lbs)", met: true },
        { text: "Good general health and physical condition", met: true },
        { text: "Valid government ID proof with photo", met: true },
      ],
    },
    {
      category: "Health Conditions",
      icon: Activity,
      color: "green",
      description: "Clinical vital signs and medical baseline",
      criteria: [
        { text: "Hemoglobin level ≥ 12.5 g/dL", met: true },
        { text: "Blood pressure within stable normal range", met: true },
        { text: "No active cold, flu or throat infection in past 7 days", met: true },
        { text: "No history of serious heart disease", met: false },
        { text: "No history of epilepsy or seizure disorders", met: false },
      ],
    },
    {
      category: "Lifestyle Factors",
      icon: Clock,
      color: "purple",
      description: "Recent habits and exposure considerations",
      criteria: [
        { text: "No alcohol consumption in the last 24 hours", met: true },
        { text: "No smoking in the last 24 hours prior to donation", met: true },
        { text: "Adequate sleep (minimum 6 hours) the night before", met: true },
        { text: "No high-risk physical exposures in the last 4 months", met: false },
      ],
    },
    {
      category: "Medical History",
      icon: Shield,
      color: "orange",
      description: "Recent procedures, treatments, or vaccinations",
      criteria: [
        { text: "No major surgical procedures in last 6 months", met: true },
        { text: "No blood transfusion received in last 6 months", met: true },
        { text: "No vaccination shots in the last 4 weeks", met: false },
        { text: "Free from major active chronic illnesses", met: false },
      ],
    },
  ];

  const temporaryDeferrals = [
    { condition: "Pregnancy or breastfeeding", period: "6 months after delivery/weaning", category: "pregnancy" },
    { condition: "Recent tattoo or body piercing", period: "6 months from the date of procedure", category: "procedural" },
    { condition: "Dental work (extraction, surgery, filling)", period: "24 to 72 hours depending on type", category: "medical" },
    { condition: "Recent travel to malaria-endemic areas", period: "1 to 3 years depending on stay length", category: "travel" },
    { condition: "COVID-19 infection", period: "14 days after complete recovery", category: "infection" },
    { condition: "Active prescription antibiotics", period: "7 days after completing course", category: "medical" },
    { condition: "Minor fever, cold, or flu symptoms", period: "7 days after complete symptom relief", category: "infection" },
    { condition: "Alcohol consumption", period: "24 hours deferral", category: "lifestyle" },
  ];

  const permanentDeferrals = [
    { condition: "HIV / AIDS positive status", desc: "To guarantee recipient safety from immunodeficiency viruses." },
    { condition: "Hepatitis B or Hepatitis C history", desc: "Risk of transmitting severe liver-damaging infections." },
    { condition: "Active cancer or history of leukemia", desc: "Permanent deferral for oncologist clearance and donor safety." },
    { condition: "Chronic kidney or liver failure", desc: "Donor's body cannot withstand rapid blood volume changes." },
    { condition: "Severe heart disease or stroke history", desc: "High cardiovascular risk during fluid volume extraction." },
    { condition: "Hemophilia or bleeding disorders", desc: "Donor's blood will not clot properly at venipuncture site." },
  ];

  const preDonationTips = [
    {
      title: "Focus on Iron-Rich Diet",
      text: "Eat iron-rich foods such as spinach, red meat, beans, fish, and fortified cereals in the days leading up to your donation to maintain healthy hemoglobin levels.",
      icon: Droplet,
      color: "red"
    },
    {
      title: "Super-Hydrate Your Body",
      text: "Drink plenty of water (at least 500ml or 3-4 glasses extra) in the 24 hours preceding your donation, especially in warm climates, to keep blood volume high.",
      icon: Sparkles,
      color: "blue"
    },
    {
      title: "Get Restful Sleep",
      text: "Ensure you get at least 6-8 hours of sound sleep the night before your donation. Avoid late nights to prevent dizziness or fatigue post-donation.",
      icon: Clock,
      color: "purple"
    },
    {
      title: "Avoid Alcohol & Smokes",
      text: "Do not consume alcoholic beverages or smoke tobacco for at least 24 hours before your donation. This stabilizes heart rates and blood oxygenation levels.",
      icon: Activity,
      color: "orange"
    }
  ];

  // Evaluate quiz responses
  const evaluateQuiz = () => {
    const { age, weight, lastDonation, healthy, pregnant } = quizAnswers;
    
    if (age === "under" || age === "over" || weight === "under") {
      return {
        status: "ineligible",
        message: "You do not meet the baseline physical requirements.",
        reasons: [
          age === "under" && "Donors must be at least 18 years old.",
          age === "over" && "Maximum age threshold for blood donation is 65 years.",
          weight === "under" && "Minimum weight threshold for donation is 50 kg (110 lbs) for physical safety."
        ].filter(Boolean),
        icon: XCircle,
        color: "red",
        actionText: "Check Other Support Options",
        actionPath: "/camps"
      };
    }

    if (lastDonation === "recent" || healthy === "no" || pregnant === "yes") {
      return {
        status: "deferred",
        message: "You are temporarily deferred from donating blood.",
        reasons: [
          lastDonation === "recent" && "Blood donation interval must be at least 3 months.",
          healthy === "no" && "You must be completely symptom-free from cold, cough, fever or flu.",
          pregnant === "yes" && "Pregnant and breastfeeding mothers are deferred to protect maternal and child health."
        ].filter(Boolean),
        icon: AlertCircle,
        color: "amber",
        actionText: "View Temporary Deferrals",
        actionCallback: () => setActiveTab("deferrals")
      };
    }

    return {
      status: "eligible",
      message: "Great news! You appear to meet the basic eligibility criteria.",
      reasons: [
        "You meet the age and weight baselines.",
        "Your donation interval is safe.",
        "You are feeling healthy today."
      ],
      icon: CheckCircle,
      color: "green",
      actionText: "Find Nearby Donation Camps",
      actionPath: "/camps"
    };
  };

  const quizResult = quizSubmitted ? evaluateQuiz() : null;

  const handleQuizAnswer = (field, value) => {
    setQuizAnswers(prev => ({ ...prev, [field]: value }));
    setQuizSubmitted(false);
  };

  const isQuizComplete = 
    quizAnswers.age && 
    quizAnswers.weight && 
    quizAnswers.lastDonation && 
    quizAnswers.healthy && 
    quizAnswers.pregnant;

  // Filter deferrals
  const filteredDeferrals = temporaryDeferrals.filter(item =>
    item.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.period.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        <title>Blood Donation Eligibility Criteria | LifeDrop</title>
        <meta
          name="description"
          content="Check if you're eligible to donate blood. Interactive eligibility checker, deferral search, and guidelines."
        />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative pt-28 pb-24 bg-gradient-to-br from-red-800 via-red-700 to-rose-900 text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/30 border border-red-500/20 text-xs font-semibold uppercase tracking-wider text-red-200 mb-6 animate-pulse">
                <Heart className="w-3.5 h-3.5 text-red-400" /> Save Lives Safely
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight drop-shadow-sm">
                Can I Donate Blood?
              </h1>
              <p className="text-lg md:text-xl text-red-100 max-w-2xl mx-auto font-medium leading-relaxed">
                Your health and safety are our top priorities. Take our quick eligibility quiz or explore detailed medical requirements before registering.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="sticky top-[72px] z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto no-scrollbar py-3 gap-2 md:justify-center">
              <button
                onClick={() => setActiveTab("quiz")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex-shrink-0 cursor-pointer ${
                  activeTab === "quiz"
                    ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                Quick Eligibility Quiz
              </button>
              <button
                onClick={() => setActiveTab("detailed")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex-shrink-0 cursor-pointer ${
                  activeTab === "detailed"
                    ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Detailed Requirements
              </button>
              <button
                onClick={() => setActiveTab("deferrals")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex-shrink-0 cursor-pointer ${
                  activeTab === "deferrals"
                    ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Clock className="w-4 h-4" />
                Temporary Deferrals
              </button>
              <button
                onClick={() => setActiveTab("exclusions")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex-shrink-0 cursor-pointer ${
                  activeTab === "exclusions"
                    ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <XCircle className="w-4 h-4" />
                Permanent Exclusions
              </button>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          
          {/* TAB 1: QUICK ELIGIBILITY QUIZ */}
          {activeTab === "quiz" && (
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 animate-fade-in">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">1-Minute Eligibility Test</h2>
                  <p className="text-slate-500 text-sm">Answer these basic questions for an immediate assessment.</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Q1: Age */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <label className="block text-slate-800 font-bold mb-3">1. What is your age?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["Under 18 years", "18 to 65 years", "Over 65 years"].map((opt, i) => {
                      const val = i === 0 ? "under" : i === 1 ? "ok" : "over";
                      return (
                        <button
                          key={opt}
                          onClick={() => handleQuizAnswer("age", val)}
                          className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                            quizAnswers.age === val
                              ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-500/25"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Q2: Weight */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <label className="block text-slate-800 font-bold mb-3">2. What is your body weight?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Less than 50 kg (110 lbs)", value: "under" },
                      { label: "50 kg (110 lbs) or more", value: "ok" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleQuizAnswer("weight", opt.value)}
                        className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                          quizAnswers.weight === opt.value
                            ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-500/25"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q3: Interval */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <label className="block text-slate-800 font-bold mb-3">3. Have you donated blood in the last 3 months?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Yes, within the last 3 months", value: "recent" },
                      { label: "No, or I have never donated", value: "ok" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleQuizAnswer("lastDonation", opt.value)}
                        className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                          quizAnswers.lastDonation === opt.value
                            ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-500/25"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q4: Health Status */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <label className="block text-slate-800 font-bold mb-3">4. Are you feeling healthy, active and symptom-free today?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Yes, I feel perfectly healthy", value: "ok" },
                      { label: "No, I have a cold / cough / fever / illness", value: "no" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleQuizAnswer("healthy", opt.value)}
                        className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                          quizAnswers.healthy === opt.value
                            ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-500/25"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q5: Pregnancy */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <label className="block text-slate-800 font-bold mb-3">5. Are you currently pregnant or breastfeeding?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Yes", value: "yes" },
                      { label: "No / Not Applicable", value: "ok" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleQuizAnswer("pregnant", opt.value)}
                        className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                          quizAnswers.pregnant === opt.value
                            ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-500/25"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={!isQuizComplete}
                  className="px-10 py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-lg disabled:shadow-none hover:scale-[1.03] transition-all cursor-pointer flex items-center gap-2"
                >
                  <Heart className="w-5 h-5 fill-current" /> Check My Eligibility
                </button>
                {!isQuizComplete && (
                  <p className="text-slate-400 text-xs mt-3">Please answer all 5 questions above to see the results.</p>
                )}
              </div>

              {/* Quiz Results Message */}
              {quizSubmitted && quizResult && (
                <div className={`mt-8 p-6 rounded-3xl border-2 animate-fade-in ${
                  quizResult.status === "eligible"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : quizResult.status === "deferred"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}>
                  <div className="flex items-start gap-4">
                    <quizResult.icon className={`w-8 h-8 flex-shrink-0 ${
                      quizResult.status === "eligible"
                        ? "text-emerald-600"
                        : quizResult.status === "deferred"
                        ? "text-amber-600"
                        : "text-rose-600"
                    }`} />
                    <div className="flex-grow">
                      <h4 className="text-xl font-bold mb-2">{quizResult.message}</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm font-medium mb-5">
                        {quizResult.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                      
                      {quizResult.actionPath ? (
                        <button
                          onClick={() => navigate(quizResult.actionPath)}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all hover:scale-105 cursor-pointer ${
                            quizResult.status === "eligible"
                              ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
                              : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/25"
                          }`}
                        >
                          {quizResult.actionText} <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={quizResult.actionCallback}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-600/25 transition-all hover:scale-105 cursor-pointer"
                        >
                          {quizResult.actionText} <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DETAILED CRITERIA REQUIREMENTS */}
          {activeTab === "detailed" && (
            <div className="space-y-12 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eligibilityCriteria.map((section, idx) => {
                  const Icon = section.icon;
                  const colors = {
                    blue: { card: "border-blue-100", iconBg: "bg-blue-50 text-blue-600", dot: "text-blue-500" },
                    green: { card: "border-green-100", iconBg: "bg-green-50 text-green-600", dot: "text-green-500" },
                    purple: { card: "border-purple-100", iconBg: "bg-purple-50 text-purple-600", dot: "text-purple-500" },
                    orange: { card: "border-orange-100", iconBg: "bg-orange-50 text-orange-600", dot: "text-orange-500" },
                  };
                  const activeColor = colors[section.color] || colors.blue;

                  return (
                    <div
                      key={idx}
                      className={`bg-white rounded-3xl p-6 shadow-md border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] ${activeColor.card}`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-2xl ${activeColor.iconBg}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800">{section.category}</h3>
                          <p className="text-xs text-slate-400">{section.description}</p>
                        </div>
                      </div>

                      <div className="space-y-3.5 mt-6">
                        {section.criteria.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-start gap-3 p-2 bg-slate-50/50 rounded-xl">
                            {item.met ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm font-semibold ${item.met ? "text-slate-700" : "text-slate-400 line-through"}`}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TEMPORARY DEFERRALS */}
          {activeTab === "deferrals" && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 space-y-8 animate-fade-in">
              <div className="max-w-xl">
                <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-amber-500" /> Temporary Deferral Periods
                </h2>
                <p className="text-slate-500 text-sm">
                  Certain procedures, lifestyles or health updates require you to wait a specific duration before you can safely donate blood.
                </p>
              </div>

              {/* Deferral Search Bar */}
              <div className="max-w-md relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search condition (e.g. tattoo, pregnancy, COVID)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium text-slate-700 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Deferrals Grid */}
              {filteredDeferrals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDeferrals.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-5 bg-slate-50 hover:bg-red-50/20 rounded-2xl border border-slate-100 transition-colors"
                    >
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-800 text-sm md:text-base">
                          {item.condition}
                        </p>
                        <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                          Deferral Period
                        </p>
                        <p className="text-sm font-bold text-red-600 mt-0.5">
                          {item.period}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-semibold text-sm">No temporary deferrals found matching your search term.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PERMANENT EXCLUSIONS */}
          {activeTab === "exclusions" && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 space-y-8 animate-fade-in">
              <div className="max-w-xl">
                <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-red-600" /> Permanent Deferrals
                </h2>
                <p className="text-slate-500 text-sm">
                  The following medical conditions permanently prevent blood donation to guarantee recipient safety as well as the donor's health.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {permanentDeferrals.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-5 bg-rose-50/30 rounded-2xl border border-rose-100"
                  >
                    <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800">{item.condition}</p>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRE-DONATION PREPARATION ADVICE */}
          <div className="mt-16 bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-10">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                <Droplet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">Pre-Donation Guidelines</h2>
                <p className="text-slate-500 text-sm">Follow these simple steps in the 24 hours leading to your donation.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {preDonationTips.map((tip, idx) => {
                const colors = {
                  red: "bg-red-50 text-red-600 border-red-100",
                  blue: "bg-blue-50 text-blue-600 border-blue-100",
                  purple: "bg-purple-50 text-purple-600 border-purple-100",
                  orange: "bg-orange-50 text-orange-600 border-orange-100",
                };
                const col = colors[tip.color] || colors.red;
                return (
                  <div key={idx} className={`bg-slate-50/50 p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] ${col.borderColor || 'border-slate-100'}`}>
                    <div className={`p-2.5 rounded-xl inline-flex mb-4 ${col}`}>
                      <tip.icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">{tip.title}</h4>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{tip.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Call To Action */}
          <div className="mt-16 bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-xl shadow-red-600/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#ffffff08_0,transparent_50%)]"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h3 className="text-2xl md:text-3xl font-black leading-tight">Ready to Become a Lifesaver?</h3>
              <p className="text-red-100 text-sm md:text-base font-medium">
                If you meet the eligibility requirements, you can register as a donor immediately, check-in to active blood donation drives, and earn certificates.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => navigate("/register/donor")}
                  className="px-8 py-3.5 bg-white hover:bg-slate-50 text-red-600 font-extrabold rounded-2xl shadow-lg transition-transform hover:scale-105 cursor-pointer text-sm"
                >
                  Register as Donor
                </button>
                <button
                  onClick={() => navigate("/camps")}
                  className="px-8 py-3.5 bg-red-700/40 hover:bg-red-700/60 border border-white/20 text-white font-bold rounded-2xl transition-transform hover:scale-105 cursor-pointer text-sm"
                >
                  Browse Camps
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EligibilityCriteria;
