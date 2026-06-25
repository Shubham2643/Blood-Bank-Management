// src/pages/footer/FAQs.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Heart,
  Droplet,
  Users,
  Shield,
  Clock,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Award,
  Star,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Download,
  Printer,
} from "lucide-react";
import { toast } from "react-hot-toast";

const FAQs = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openItems, setOpenItems] = useState([]);
  const [helpfulFeedback, setHelpfulFeedback] = useState(() => {
    try {
      const saved = localStorage.getItem("faq_feedback");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // FAQ Categories
  const categories = [
    { id: "all", name: "All FAQs", icon: HelpCircle, count: 36 },
    { id: "general", name: "General", icon: Heart, count: 8 },
    { id: "eligibility", name: "Eligibility", icon: CheckCircle, count: 6 },
    { id: "process", name: "Donation Process", icon: Droplet, count: 7 },
    { id: "aftercare", name: "After Care", icon: Activity, count: 5 },
    { id: "benefits", name: "Benefits", icon: Award, count: 4 },
    { id: "technical", name: "Technical", icon: Shield, count: 3 },
    { id: "emergency", name: "Emergency", icon: AlertCircle, count: 3 },
  ];

  // FAQ Data
  const faqs = [
    {
      id: 1,
      question: "Who can donate blood?",
      answer:
        "Generally, anyone who is healthy, aged between 18-65 years, and weighs at least 50 kg can donate blood. However, there are specific eligibility criteria that must be met. Donors should be in good health, free from infections, and not have any chronic diseases. A mini-physical examination is conducted before each donation to ensure safety.",
      category: "general",
      icon: Heart,
      helpful: 245,
      notHelpful: 12,
      relatedQuestions: [2, 3, 5],
    },
    {
      id: 2,
      question: "How often can I donate blood?",
      answer:
        "For whole blood donation, you can donate every 56 days (8 weeks). This allows your body sufficient time to replenish the red blood cells. Platelet donations can be made more frequently - every 7 days, up to 24 times per year. Plasma can be donated every 28 days. The frequency depends on the type of donation and your overall health.",
      category: "general",
      icon: Clock,
      helpful: 189,
      notHelpful: 8,
      relatedQuestions: [1, 5, 15],
    },
    {
      id: 3,
      question: "What are the basic eligibility requirements?",
      answer:
        "Basic requirements include: Age between 18-65 years, weight minimum 50 kg, hemoglobin level at least 12.5 g/dL, normal blood pressure, no cold/flu in past 7 days, no major surgery in past 6 months, no high-risk activities, and good general health. A valid ID proof is also required. Final eligibility is determined by medical staff at the time of donation.",
      category: "eligibility",
      icon: CheckCircle,
      helpful: 312,
      notHelpful: 15,
      relatedQuestions: [1, 4, 6],
    },
    {
      id: 4,
      question: "Can I donate blood if I have a tattoo?",
      answer:
        "If you've gotten a tattoo, you typically need to wait 6 months before donating blood. This waiting period is a precautionary measure to ensure you haven't been exposed to blood-borne infections like hepatitis. However, if the tattoo was done at a regulated and licensed facility using sterile needles and single-use ink, some blood banks may reduce this waiting period.",
      category: "eligibility",
      icon: AlertCircle,
      helpful: 156,
      notHelpful: 23,
      relatedQuestions: [3, 6, 8],
    },
    {
      id: 5,
      question: "How long does the blood donation process take?",
      answer:
        "The entire process typically takes about 60 minutes. This includes registration (15 min), health screening and medical history review (15 min), the actual blood donation (8-10 min), and post-donation rest with refreshments (15-20 min). The actual blood collection is relatively quick, but the preparation and recovery steps are important for your safety.",
      category: "process",
      icon: Clock,
      helpful: 278,
      notHelpful: 10,
      relatedQuestions: [2, 7, 14],
    },
    {
      id: 6,
      question: "What should I eat before donating blood?",
      answer:
        "Before donating, eat a healthy meal 2-3 hours prior. Focus on iron-rich foods like leafy greens, lean red meat, beans, and fortified cereals. Stay hydrated by drinking plenty of water. Avoid fatty foods as they can affect blood tests. Also, avoid alcohol for 24 hours before donation and ensure you've had adequate sleep the night before.",
      category: "process",
      icon: Activity,
      helpful: 203,
      notHelpful: 17,
      relatedQuestions: [5, 7, 9],
    },
    {
      id: 7,
      question: "What happens after I donate blood?",
      answer:
        "After donation, you'll be asked to rest for 15-20 minutes and enjoy refreshments. Your body will replace the fluid within 24 hours and red blood cells within 4-6 weeks. You should avoid strenuous activities for 24 hours, keep the bandage on for 4-6 hours, and increase fluid intake. Contact us if you feel unwell or have any concerns.",
      category: "aftercare",
      icon: Activity,
      helpful: 167,
      notHelpful: 9,
      relatedQuestions: [5, 8, 14],
    },
    {
      id: 8,
      question: "Are there any side effects of blood donation?",
      answer:
        "Most donors experience no side effects. Some may feel slight dizziness, fatigue, or have minor bruising at the needle site. These effects are temporary and usually resolve quickly. Serious complications are extremely rare. Staying hydrated, eating well, and resting after donation minimizes any potential side effects.",
      category: "aftercare",
      icon: Smile,
      helpful: 145,
      notHelpful: 21,
      relatedQuestions: [7, 9, 14],
    },
    {
      id: 9,
      question: "What are the health benefits of donating blood?",
      answer:
        "Blood donation offers several health benefits: free health check-up (blood pressure, hemoglobin, pulse), reduced risk of heart disease by lowering iron levels, calorie burning (approx. 650 calories), stimulation of new blood cell production, and potential longevity benefits. Regular donors also get insights into their health through routine screenings.",
      category: "benefits",
      icon: Award,
      helpful: 234,
      notHelpful: 11,
      relatedQuestions: [10, 11, 15],
    },
    {
      id: 10,
      question: "Do I get any rewards for donating blood?",
      answer:
        "Yes! Donors receive recognition based on donation frequency: Bronze (5-10 donations), Silver (11-25), Gold (26-50), Platinum (51-100), and Diamond (100+). Benefits include digital badges, certificates, exclusive merchandise, partner discounts, and invitations to donor appreciation events. Some blood banks also offer refreshments and small tokens of appreciation.",
      category: "benefits",
      icon: Star,
      helpful: 198,
      notHelpful: 14,
      relatedQuestions: [9, 11, 15],
    },
    {
      id: 11,
      question: "How is my donated blood used?",
      answer:
        "Your donated blood is separated into components: red blood cells (for anemia/surgery), platelets (for cancer patients), and plasma (for burn victims/clotting disorders). One donation can help up to 3 patients. Blood is tested, processed, and distributed to hospitals based on patient needs. It's used for emergencies, surgeries, chronic conditions, and medical treatments.",
      category: "general",
      icon: Droplet,
      helpful: 221,
      notHelpful: 8,
      relatedQuestions: [1, 9, 12],
    },
    {
      id: 12,
      question: "Is blood donation safe?",
      answer:
        "Yes, blood donation is extremely safe. Sterile, single-use equipment is used for each donor, eliminating any risk of infection. Medical professionals supervise the process, and donors are screened for eligibility. Your body quickly replenishes the donated blood. The entire process follows strict safety protocols to protect both donors and recipients.",
      category: "technical",
      icon: Shield,
      helpful: 267,
      notHelpful: 5,
      relatedQuestions: [1, 3, 13],
    },
    {
      id: 13,
      question: "How is my blood tested after donation?",
      answer:
        "After donation, your blood undergoes rigorous testing for: blood type (A, B, AB, O) and Rh factor, infectious diseases (HIV, Hepatitis B & C, Syphilis, Malaria), and antibody screening. Tests are conducted in licensed laboratories following strict protocols. If any issues are found, you'll be notified confidentially and advised on next steps.",
      category: "technical",
      icon: FileText,
      helpful: 134,
      notHelpful: 7,
      relatedQuestions: [11, 12, 15],
    },
    {
      id: 14,
      question: "Can I donate blood during pregnancy?",
      answer:
        "No, pregnant women cannot donate blood. You must wait at least 6 months after delivery or after weaning (whichever is later) before donating blood. This waiting period ensures both mother and baby are healthy and allows the mother's body to recover from pregnancy and childbirth.",
      category: "eligibility",
      icon: Frown,
      helpful: 89,
      notHelpful: 4,
      relatedQuestions: [3, 4, 6],
    },
    {
      id: 15,
      question: "How can I track my donation history?",
      answer:
        "You can track your donation history through your LifeDrop account dashboard. It shows donation dates, locations, blood type, and recognition badges. You can also download donation certificates and view your lifetime contribution statistics. This history is important for tracking your eligibility for future donations.",
      category: "technical",
      icon: TrendingUp,
      helpful: 112,
      notHelpful: 6,
      relatedQuestions: [9, 10, 13],
    },
  ];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchTerm === "" ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Toggle FAQ item
  const toggleItem = (id) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Handle helpful feedback
  const handleHelpful = (id, isHelpful) => {
    const updated = {
      ...helpfulFeedback,
      [id]: isHelpful,
    };
    setHelpfulFeedback(updated);
    localStorage.setItem("faq_feedback", JSON.stringify(updated));

    toast.success(
      isHelpful
        ? "Thanks for your feedback!"
        : "Sorry to hear that. We'll improve this answer.",
    );
  };

  // Get category icon
  const getCategoryIcon = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    const Icon = category?.icon || HelpCircle;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Frequently Asked Questions (FAQs) | LifeDrop</title>
        <meta
          name="description"
          content="Find answers to frequently asked questions about blood donation, eligibility, requirements, safety, and donor benefits."
        />
      </Helmet>
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-red-100 mb-8">
                Find answers to common questions about blood donation. Can't
                find what you're looking for? Contact us!
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search your question..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:w-80">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-red-600" />
                  Categories
                </h2>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = selectedCategory === category.id;
                    const count =
                      category.id === "all"
                        ? faqs.length
                        : faqs.filter((f) => f.category === category.id).length;

                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all ${
                          isActive
                            ? "bg-red-600 text-white"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500"}`}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            isActive ? "bg-white/20" : "bg-gray-200"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Contact Support */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Still have questions?
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => (window.location.href = "/contact")}
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-3"
                    >
                      <MessageCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Contact Support
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = "mailto:help@lifedrop.org")
                      }
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-3"
                    >
                      <Mail className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Email Us
                      </span>
                    </button>
                    <button
                      onClick={() => (window.location.href = "tel:18002566369")}
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-3"
                    >
                      <Phone className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Call Helpline
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ List */}
            <div className="flex-1">
              {/* Results Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    Showing{" "}
                    <span className="font-bold text-red-600">
                      {filteredFaqs.length}
                    </span>{" "}
                    questions
                    {searchTerm && <span> for "{searchTerm}"</span>}
                  </p>
                  <button
                    onClick={() => {
                      setOpenItems(filteredFaqs.map((f) => f.id));
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Expand All
                  </button>
                </div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFaqs.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      No questions found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Try searching with different keywords or browse all
                      categories
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                      }}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const Icon = faq.icon;
                    const isOpen = openItems.includes(faq.id);
                    const feedback = helpfulFeedback[faq.id];

                    return (
                      <div
                        key={faq.id}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
                      >
                        {/* Question */}
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className="w-full p-6 flex items-start gap-4 text-left"
                        >
                          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1.5 w-fit">
                                {getCategoryIcon(faq.category)}
                                {
                                  categories.find((c) => c.id === faq.category)
                                    ?.name
                                }
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 pr-8">
                              {faq.question}
                            </h3>
                          </div>
                          <div className="flex-shrink-0">
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </button>

                        {/* Answer */}
                        {isOpen && (
                          <div className="px-6 pb-6 pt-2 border-t">
                            <div className="prose max-w-none">
                              <p className="text-gray-600 leading-relaxed mb-4">
                                {faq.answer}
                              </p>
                            </div>

                            {/* Related Questions */}
                            {faq.relatedQuestions &&
                              faq.relatedQuestions.length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                    Related Questions:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {faq.relatedQuestions.map((id) => {
                                      const related = faqs.find(
                                        (f) => f.id === id,
                                      );
                                      return related ? (
                                        <button
                                          key={id}
                                          onClick={() => {
                                            if (!openItems.includes(id)) {
                                              toggleItem(id);
                                            }
                                          }}
                                          className="text-sm text-red-600 hover:text-red-700 bg-white px-3 py-1 rounded-full border border-gray-200"
                                        >
                                          {related.question.substring(0, 40)}...
                                        </button>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}

                            {/* Helpful Section */}
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                  Was this helpful?
                                </span>
                                <button
                                  onClick={() => handleHelpful(faq.id, true)}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                                    feedback === true
                                      ? "bg-green-100 text-green-700"
                                      : "hover:bg-green-50 text-gray-600"
                                  }`}
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  <span className="text-sm">
                                    Yes ({feedback === true ? faq.helpful + 1 : faq.helpful})
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleHelpful(faq.id, false)}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                                    feedback === false
                                      ? "bg-red-100 text-red-700"
                                      : "hover:bg-red-50 text-gray-600"
                                  }`}
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                  <span className="text-sm">
                                    No ({feedback === false ? faq.notHelpful + 1 : faq.notHelpful})
                                  </span>
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    faq.question + "\n\n" + faq.answer,
                                  );
                                  toast.success("Copied to clipboard!");
                                }}
                                className="text-sm text-gray-500 hover:text-gray-700"
                              >
                                Copy Answer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Still Need Help */}
              <div className="mt-8 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
                  <p className="text-red-100 mb-6 max-w-2xl mx-auto">
                    Can't find the answer you're looking for? Our support team
                    is here to help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate("/contact")}
                      className="px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold inline-flex items-center gap-2"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Contact Support
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = "mailto:help@lifedrop.org")
                      }
                      className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-colors font-semibold inline-flex items-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      Email Us
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;
