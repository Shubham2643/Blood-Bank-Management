// src/pages/footer/FAQs.jsx
import React, { useState, useEffect } from "react";
import SEO from "../../components/SEO";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Search,
  ChevronDown,
  Heart,
  Droplet,
  Shield,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  Award,
  Star,
  TrendingUp,
  Smile,
  Frown,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  PlusCircle,
  X,
  Send,
  Loader2,
  Printer,
  Sparkles,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Dynamic rotating search placeholders
const PLACEHOLDER_SUGGESTIONS = [
  "Search e.g. 'Can I donate blood if I have a tattoo?'",
  "Search e.g. 'How often can I donate whole blood?'",
  "Search e.g. 'What are the age and weight limits?'",
  "Search e.g. 'Is blood donation completely safe?'",
  "Search e.g. 'How do emergency blood requests work?'",
  "Search e.g. 'What should I eat before donating?'",
];

const FAQs = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("helpful"); // "helpful" | "alphabetical" | "newest"
  const [openItems, setOpenItems] = useState([]);
  const [showAskModal, setShowAskModal] = useState(false);
  const [submittingAsk, setSubmittingAsk] = useState(false);

  const [askFormData, setAskFormData] = useState({
    name: "",
    email: "",
    category: "general",
    question: "",
  });

  // Persisted Saved/Bookmarked FAQs
  const [savedFaqs, setSavedFaqs] = useState(() => {
    try {
      const saved = localStorage.getItem("saved_faqs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persisted Helpful Feedback
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
    { id: "all", name: "All FAQs", icon: HelpCircle },
    { id: "saved", name: "Saved FAQs", icon: Bookmark },
    { id: "general", name: "General", icon: Heart },
    { id: "eligibility", name: "Eligibility", icon: CheckCircle },
    { id: "process", name: "Donation Process", icon: Droplet },
    { id: "aftercare", name: "After Care", icon: Activity },
    { id: "benefits", name: "Benefits", icon: Award },
    { id: "technical", name: "Technical", icon: Shield },
    { id: "emergency", name: "Emergency", icon: AlertCircle },
  ];

  // Comprehensive FAQ Dataset
  const [faqs] = useState([
    {
      id: 1,
      question: "Who can donate blood?",
      answer:
        "Generally, anyone who is healthy, aged between 18-65 years, and weighs at least 50 kg can donate blood. Donors should be in good health, free from infections, and not have any chronic diseases. A mini-physical examination is conducted before each donation to ensure safety.",
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
        "For whole blood donation, you can donate every 56 days (8 weeks). Platelet donations can be made every 7 days, up to 24 times per year. Plasma can be donated every 28 days. The frequency depends on the type of donation and your overall health.",
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
        "Basic requirements include: Age 18-65 years, weight minimum 50 kg, hemoglobin level at least 12.5 g/dL, normal blood pressure, no cold/flu in past 7 days, no major surgery in past 6 months, and good general health. A valid ID proof is required.",
      category: "eligibility",
      icon: CheckCircle,
      helpful: 312,
      notHelpful: 15,
      relatedQuestions: [1, 4, 6],
    },
    {
      id: 4,
      question: "Can I donate blood if I have a tattoo or piercing?",
      answer:
        "If you've gotten a tattoo or body piercing, you typically need to wait 6 months before donating blood. This waiting period ensures you haven't been exposed to blood-borne infections like hepatitis. If done at a licensed sterile facility, some centers may reduce this timeframe.",
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
        "The entire process takes about 60 minutes: Registration (15 min), health screening & mini physical (15 min), blood collection (8-10 min), and post-donation rest with refreshments (15-20 min).",
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
        "Eat a healthy meal 2-3 hours prior. Focus on iron-rich foods like leafy greens, lean meat, and beans. Drink plenty of water (500ml). Avoid fatty foods as they can interfere with blood testing, and avoid alcohol for 24 hours prior.",
      category: "process",
      icon: Activity,
      helpful: 203,
      notHelpful: 17,
      relatedQuestions: [5, 7, 9],
    },
    {
      id: 7,
      question: "What happens immediately after I donate blood?",
      answer:
        "After donation, rest for 15-20 minutes and enjoy complimentary juice and snacks. Fluid volume is restored within 24 hours. Avoid heavy lifting or strenuous exercise for 24 hours, keep the bandage on for 4 hours, and increase liquid intake.",
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
        "Most donors feel completely normal. Slight dizziness or mild bruising at the needle site can occasionally occur but resolves quickly. Staying well-hydrated and resting after your donation eliminates almost all minor symptoms.",
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
        "Benefits include: free mini-health screening (blood pressure, pulse, hemoglobin), lowering excess iron levels to reduce cardiovascular risk, stimulation of fresh blood cell production, and burning ~650 calories per unit donated.",
      category: "benefits",
      icon: Award,
      helpful: 234,
      notHelpful: 11,
      relatedQuestions: [10, 11, 15],
    },
    {
      id: 10,
      question: "Do I get certificates or recognition badges?",
      answer:
        "Yes! Every donation earns a verified digital LifeDrop donation certificate and milestone badges (Bronze for 5+ donations, Silver for 10+, Gold for 25+, Platinum for 50+). Certificates can be downloaded instantly from your profile.",
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
        "Your blood is separated into red blood cells (surgeries/trauma), platelets (cancer treatment), and plasma (burns/clotting). A single 450ml donation can save up to 3 lives across regional hospitals.",
      category: "general",
      icon: Droplet,
      helpful: 221,
      notHelpful: 8,
      relatedQuestions: [1, 9, 12],
    },
    {
      id: 12,
      question: "Is blood donation completely safe?",
      answer:
        "Yes, 100% safe. Sterile, brand-new single-use needles are opened in front of you for every donation and immediately discarded. There is zero risk of contracting any disease from donating blood.",
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
        "Donated blood undergoes laboratory testing for blood group (A, B, AB, O, Rh factor), HIV 1 & 2, Hepatitis B & C, Syphilis, and Malaria. If any anomaly is detected, you are notified confidentially.",
      category: "technical",
      icon: FileText,
      helpful: 134,
      notHelpful: 7,
      relatedQuestions: [11, 12, 15],
    },
    {
      id: 14,
      question: "Can I donate blood during pregnancy or breastfeeding?",
      answer:
        "No, pregnant women cannot donate blood. You must wait at least 6 months after delivery and complete weaning before donating to safeguard maternal and infant nutrition.",
      category: "eligibility",
      icon: Frown,
      helpful: 89,
      notHelpful: 4,
      relatedQuestions: [3, 4, 6],
    },
    {
      id: 15,
      question: "How do emergency blood requests work on LifeDrop?",
      answer:
        "Emergency blood requests broadcast instant notifications to nearby verified donors matching the required blood group. Requesters can track donor responses in real-time on the live directory.",
      category: "emergency",
      icon: AlertCircle,
      helpful: 295,
      notHelpful: 6,
      relatedQuestions: [1, 11, 13],
    },
  ]);

  // Handle URL Hash Permalinks on Load
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.location.hash) {
      const idStr = window.location.hash.replace("#faq-", "");
      const faqId = parseInt(idStr, 10);
      if (!isNaN(faqId)) {
        setOpenItems((prev) => (prev.includes(faqId) ? prev : [...prev, faqId]));
        setTimeout(() => {
          const el = document.getElementById(`faq-card-${faqId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 400);
      }
    }
  }, []);

  // Bookmark / Save FAQ
  const toggleSaveFaq = (id) => {
    let updated;
    if (savedFaqs.includes(id)) {
      updated = savedFaqs.filter((item) => item !== id);
      toast.success("Removed from Saved FAQs");
    } else {
      updated = [...savedFaqs, id];
      toast.success("Saved to your Bookmarks!");
    }
    setSavedFaqs(updated);
    localStorage.setItem("saved_faqs", JSON.stringify(updated));
  };

  // Toggle FAQ item expansion
  const toggleItem = (id) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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
        : "Feedback received. We'll update this answer."
    );
  };

  // Copy Direct Permalink
  const shareFaqPermalink = (id) => {
    const permalink = `${window.location.origin}/faqs#faq-${id}`;
    navigator.clipboard.writeText(permalink);
    toast.success("Direct link copied to clipboard!");
  };

  // Copy Question & Answer Content
  const copyFaqContent = (faq) => {
    const text = `Q: ${faq.question}\n\nA: ${faq.answer}\n\n(Source: LifeDrop Blood Management System)`;
    navigator.clipboard.writeText(text);
    toast.success("Answer text copied!");
  };

  // Submit New Question Handler
  const handleAskSubmit = (e) => {
    e.preventDefault();
    if (!askFormData.question.trim()) {
      toast.error("Please enter your question");
      return;
    }
    setSubmittingAsk(true);
    setTimeout(() => {
      setSubmittingAsk(false);
      setShowAskModal(false);
      setAskFormData({ name: "", email: "", category: "general", question: "" });
      toast.success("Your question has been submitted! Our medical team will respond shortly.");
    }, 1200);
  };

  // Filter & Sort Logic
  const filteredFaqs = faqs
    .filter((faq) => {
      const matchesSearch =
        searchTerm === "" ||
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all"
          ? true
          : selectedCategory === "saved"
          ? savedFaqs.includes(faq.id)
          : faq.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.question.localeCompare(b.question);
      }
      if (sortBy === "newest") {
        return b.id - a.id;
      }
      // default: helpful
      return b.helpful - a.helpful;
    });

  // Dynamic rotating placeholder index
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_SUGGESTIONS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);
  
  // Highlight search matching text
  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-red-100 text-red-800 font-extrabold rounded-xs px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <SEO
        title="Help Center & Frequently Asked Questions (FAQs) | LifeDrop"
        description="Find instant answers to questions about blood donation eligibility, safety, process, requirements, emergency requests, and donor benefits."
      />

      <Header />

      <main className="flex-grow">
        {/* Hero Section (Matching All Page Headers) */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-700 to-red-900 text-white pt-24 sm:pt-28 pb-16 shadow-lg">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-extrabold text-red-100 uppercase tracking-widest mb-4 shadow-sm">
                <HelpCircle className="w-3.5 h-3.5 text-red-300" />
                <span>LifeDrop Knowledge Base</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
                Frequently Asked{" "}
                <span className="bg-gradient-to-r from-red-200 via-rose-200 to-white bg-clip-text text-transparent">
                  Questions
                </span>
              </h1>
              <p className="text-base sm:text-lg text-red-100/90 mb-8 max-w-xl mx-auto font-medium leading-relaxed">
                Find instant answers to common questions about blood donation, eligibility, safety, and donor benefits.
              </p>

              {/* Glassmorphic Search Input Box (Widescreen) */}
              <div className="max-w-3xl mx-auto">
                <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] border border-white/60 p-2 focus-within:ring-4 focus-within:ring-white/40 transition-all duration-300">
                  <div className="relative flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 ml-1">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      id="faq-search-input"
                      type="text"
                      placeholder={PLACEHOLDER_SUGGESTIONS[placeholderIndex]}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-3.5 pr-20 py-2.5 rounded-xl text-slate-900 placeholder-slate-400 font-bold text-sm sm:text-base outline-none bg-transparent transition-all"
                    />
                    <div className="absolute right-3 flex items-center gap-2">
                      {searchTerm ? (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                          title="Clear search"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <kbd className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-black uppercase text-slate-400 bg-slate-100/90 rounded-lg border border-slate-200">
                          Ctrl + K
                        </kbd>
                      )}
                    </div>
                  </div>
                </div>

                {/* Popular Search Tag Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                  <span className="text-red-200/90 font-bold text-[11px] uppercase tracking-wider">Popular Searches:</span>
                  {["Tattoo", "Age Limits", "Emergency", "Certificates", "Recovery"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchTerm(tag)}
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-[11px] transition-all cursor-pointer hover:scale-105"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container (Expanded Widescreen Layout) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          
          {/* Top Category Filter Hub */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.06)] mb-8 space-y-4">
            {/* Category Filter Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-extrabold shadow-2xs">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">Browse Categories</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Select a category topic or view your saved bookmarks</p>
                </div>
              </div>

              {/* Reset Filter Action */}
              {(selectedCategory !== "all" || searchTerm !== "") && (
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchTerm("");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-extrabold transition-all cursor-pointer self-start sm:self-auto border border-red-200/60"
                >
                  <X className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* Non-Scrolling Responsive Widescreen Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2 sm:gap-2.5">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                const count =
                  category.id === "all"
                    ? faqs.length
                    : category.id === "saved"
                    ? savedFaqs.length
                    : faqs.filter((f) => f.category === category.id).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group px-3.5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-between gap-2 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md shadow-red-600/25 ring-2 ring-red-400/30"
                        : "bg-slate-50 hover:bg-red-50/70 text-slate-700 hover:text-red-700 border border-slate-200/80 hover:border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-red-500"
                        }`}
                      />
                      <span className="truncate">{category.name}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black flex-shrink-0 transition-colors ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200/70 text-slate-600 group-hover:bg-red-100 group-hover:text-red-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Bar & Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 py-3.5 mb-6 bg-white/80 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-xs font-extrabold text-slate-700">
                Showing <strong className="text-red-600 font-black">{filteredFaqs.length}</strong> questions
                {searchTerm && <span> for "<span className="text-slate-900">{searchTerm}</span>"</span>}
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 text-[11px] font-bold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-800 text-xs font-extrabold outline-none cursor-pointer"
                >
                  <option value="helpful">Most Helpful</option>
                  <option value="alphabetical">Alphabetical (A-Z)</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Print Button */}
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:bg-slate-100 transition-all cursor-pointer"
                title="Print FAQs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Print</span>
              </button>

              {/* Submit Question Button */}
              <button
                onClick={() => setShowAskModal(true)}
                className="px-4 py-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm shadow-red-600/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Ask Question</span>
              </button>

              {/* Expand / Collapse All */}
              <button
                onClick={() => {
                  if (openItems.length === filteredFaqs.length) {
                    setOpenItems([]);
                  } else {
                    setOpenItems(filteredFaqs.map((f) => f.id));
                  }
                }}
                className="px-3.5 py-1.5 bg-slate-50 hover:bg-red-50 text-red-600 border border-slate-200/80 hover:border-red-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
              >
                {openItems.length === filteredFaqs.length ? "Collapse All" : "Expand All"}
              </button>
            </div>
          </div>

          {/* FAQ Accordion Items */}
          <div className="space-y-3.5 mb-12">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
                  <HelpCircle className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedCategory === "saved" ? "No Saved FAQs Yet" : "No Matching Questions Found"}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {selectedCategory === "saved"
                    ? "Click the bookmark icon on any FAQ item to save it for quick reference here."
                    : "We couldn't find any questions matching your search. Try adjusting your query or submit a question to our team."}
                </p>
                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs shadow-md shadow-red-600/20 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setShowAskModal(true)}
                    className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Ask a Question
                  </button>
                </div>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const Icon = faq.icon;
                const isOpen = openItems.includes(faq.id);
                const isSaved = savedFaqs.includes(faq.id);
                const feedback = helpfulFeedback[faq.id];

                return (
                  <div
                    id={`faq-card-${faq.id}`}
                    key={faq.id}
                    className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? "border-red-400 shadow-[0_15px_40px_-10px_rgba(225,29,72,0.12)] ring-4 ring-red-500/10"
                        : "border-slate-200/90 shadow-[0_4px_25px_-8px_rgba(0,0,0,0.04)] hover:border-red-200 hover:shadow-xl"
                    }`}
                  >
                    {/* Question Header */}
                    <div
                      onClick={() => toggleItem(faq.id)}
                      className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left cursor-pointer group select-none"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* 3D Styled Icon Box */}
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isOpen
                              ? "bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md shadow-red-600/30 scale-105"
                              : "bg-red-50 text-red-600 group-hover:bg-red-100 group-hover:scale-105"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100/90 text-slate-600 border border-slate-200/60">
                              {categories.find((c) => c.id === faq.category)?.name}
                            </span>
                            {isSaved && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-600 border border-red-200">
                                <BookmarkCheck className="w-3 h-3 fill-red-600" /> Saved
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-black text-slate-850 group-hover:text-red-600 transition-colors leading-snug">
                            {highlightText(faq.question, searchTerm)}
                          </h3>
                        </div>
                      </div>

                      {/* Header Quick Action Tools */}
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        {/* Bookmark Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveFaq(faq.id);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                          title={isSaved ? "Remove Bookmark" : "Save FAQ"}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-red-600 fill-red-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>

                        {/* Toggle Expand Chevron Pill */}
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isOpen
                              ? "bg-red-50 text-red-600 rotate-180 ring-2 ring-red-200"
                              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Expandable Answer Body */}
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 animate-fade-in">
                        {/* Rich Answer Block with Accent Indicator */}
                        <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-slate-50/60 to-white border border-slate-200/60">
                          <div className="w-1.5 rounded-full bg-gradient-to-b from-red-600 via-rose-500 to-red-400 flex-shrink-0"></div>
                          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                            {highlightText(faq.answer, searchTerm)}
                          </p>
                        </div>

                        {/* Related Questions Tags */}
                        {faq.relatedQuestions && faq.relatedQuestions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-red-500" />
                              Related Questions:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {faq.relatedQuestions.map((relId) => {
                                const relFaq = faqs.find((f) => f.id === relId);
                                if (!relFaq) return null;
                                return (
                                  <button
                                    key={relId}
                                    onClick={() => {
                                      if (!openItems.includes(relId)) {
                                        setOpenItems((prev) => [...prev, relId]);
                                      }
                                      const el = document.getElementById(`faq-card-${relId}`);
                                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                                    }}
                                    className="px-3.5 py-1.5 bg-white hover:bg-red-50/80 border border-slate-200/90 hover:border-red-300 text-slate-700 hover:text-red-700 text-xs font-extrabold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span>{relFaq.question}</span>
                                    <ChevronDown className="w-3 h-3 text-slate-400 -rotate-90" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Bottom Actions Bar (Helpful Ratings, Copy & Share) */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="text-slate-500 font-extrabold text-xs">Was this answer helpful?</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleHelpful(faq.id, true)}
                                className={`px-3.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                  feedback === true
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm shadow-emerald-500/10 ring-2 ring-emerald-400/20 scale-105"
                                    : "bg-slate-50 hover:bg-emerald-50/60 border-slate-200 text-slate-600 hover:text-emerald-700"
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>Yes ({faq.helpful + (feedback === true ? 1 : 0)})</span>
                              </button>

                              <button
                                onClick={() => handleHelpful(faq.id, false)}
                                className={`px-3.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                  feedback === false
                                    ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm shadow-rose-500/10 ring-2 ring-rose-400/20 scale-105"
                                    : "bg-slate-50 hover:bg-rose-50/60 border-slate-200 text-slate-600 hover:text-rose-700"
                                }`}
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                                <span>No ({faq.notHelpful + (feedback === false ? 1 : 0)})</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyFaqContent(faq)}
                              className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200/80 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Copy Q&A text"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Text</span>
                            </button>
                            <button
                              onClick={() => shareFaqPermalink(faq.id)}
                              className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200/80 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Copy direct permalink"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Share Link</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Still Need Help Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700/50">
            <div className="text-center md:text-left space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">Still Have Questions?</h3>
              <p className="text-slate-300 text-sm max-w-xl">
                Our medical & support team is available 24/7 to assist you with blood requests, donation eligibility, or emergency coordination.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <button
                onClick={() => setShowAskModal(true)}
                className="px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-red-600" />
                Ask a Question
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-extrabold text-xs shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Ask a Question */}
        {showAskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-red-700 to-red-900 text-white flex justify-between items-center relative">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-red-300" />
                    Submit Your Question
                  </h3>
                  <p className="text-xs text-red-100 mt-1">Our support team will answer your query within 24 hours</p>
                </div>
                <button
                  onClick={() => setShowAskModal(false)}
                  className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAskSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={askFormData.name}
                    onChange={(e) => setAskFormData({ ...askFormData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={askFormData.email}
                    onChange={(e) => setAskFormData({ ...askFormData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category Topic
                  </label>
                  <select
                    value={askFormData.category}
                    onChange={(e) => setAskFormData({ ...askFormData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-red-500 focus:outline-none cursor-pointer"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="eligibility">Eligibility Criteria</option>
                    <option value="process">Donation Process</option>
                    <option value="emergency">Emergency Request</option>
                    <option value="technical">Technical Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Question *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your question in detail..."
                    value={askFormData.question}
                    onChange={(e) => setAskFormData({ ...askFormData, question: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAsk}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-extrabold text-xs shadow-md shadow-red-600/20 hover:from-red-700 hover:to-rose-700 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingAsk ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Question</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FAQs;
