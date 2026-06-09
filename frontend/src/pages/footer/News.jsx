import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Heart,
  Share2,
  Bookmark,
  ChevronRight,
  Search,
  Filter,
  Clock,
  User,
  Tag,
  ArrowRight,
  Loader2,
  Globe,
  Award,
  TrendingUp,
  AlertCircle,
  X,
  Download,
  Printer,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api, { newsApi as newsApiClient } from "../../services/api.js";

// API Service for news
const newsApi = {
  async getAll(filters = {}) {
    try {
      const cleanFilters = {};
      for (const key in filters) {
        if (filters[key] !== null && filters[key] !== "") {
          cleanFilters[key] = filters[key];
        }
      }

      const response = await newsApiClient.getAll(cleanFilters);
      return response.data;
    } catch (error) {
      console.error("News API Error:", error);
      return { news: MOCK_NEWS, totalPages: 3 };
    }
  },

  async getById(id) {
    try {
      const response = await newsApiClient.getById(id);
      return response.data;
    } catch (error) {
      console.error("News API Error:", error);
      return MOCK_NEWS.find(news => news.id === parseInt(id)) || null;
    }
  },

  async getCategories() {
    try {
      const response = await newsApiClient.getCategories();
      return response.data;
    } catch (error) {
      console.error("News API Error:", error);
      return {
        categories: [
          "Blood Donation",
          "Health Tips",
          "Medical Research",
          "Community",
          "Emergency",
          "Success Story",
          "Awareness Campaign",
          "Hospital Updates",
        ],
      };
    }
  },

  async likeNews(id) {
    try {
      const response = await api.post(`/news/${id}/like`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("News API Error:", error);
      return true;
    }
  },

  async saveNews(id) {
    try {
      const response = await api.post(`/news/${id}/save`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("News API Error:", error);
      return true;
    }
  },

  async getBreakingNews() {
    try {
      const response = await newsApiClient.getBreaking();
      return response.data;
    } catch (error) {
      console.error("News API Error:", error);
      return {
        news: MOCK_NEWS.filter((news) => news.breaking),
      };
    }
  },
};

// Mock Data for realistic news posts
const MOCK_NEWS = [
  {
    id: 1,
    title: "Emergency Blood Appeal: Type O Negative Levels Drop Critically",
    summary:
      "Local hospitals report urgent need for Type O Negative blood donations. Donors needed immediately at City Blood Bank.",
    content:
      "The City Blood Bank has issued an emergency appeal for Type O Negative blood donors as supplies have dropped to critically low levels. Type O Negative is known as the 'universal donor' and is essential for emergency transfusions. Several area hospitals report that current supplies would last less than 48 hours at current usage rates. Donation centers are extending hours this week to accommodate donors.",
    category: "Emergency",
    author: "Dr. Sarah Johnson",
    date: "March 15, 2026",
    readTime: 3,
    image:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format",
    likes: 234,
    comments: 45,
    breaking: true,
    featured: true,
  },
  {
    id: 2,
    title: "New Study Reveals Blood Donation Reduces Heart Disease Risk",
    summary:
      "Regular blood donors show 30% lower risk of heart attacks, according to 10-year medical study.",
    content:
      "A comprehensive 10-year study published in the Journal of American Medicine has found that regular blood donors have a significantly lower risk of cardiovascular disease. The study tracked 50,000 participants and found that those who donated blood at least twice a year had 30% fewer heart attacks and strokes. Researchers believe this may be due to reduced iron stores in the body, which can contribute to oxidative stress.",
    category: "Medical Research",
    author: "Prof. Michael Chen",
    date: "March 14, 2026",
    readTime: 5,
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format",
    likes: 567,
    comments: 89,
    breaking: false,
    featured: false,
  },
  {
    id: 3,
    title: "Annual Blood Donation Camp Breaks Records: 5000 Units Collected",
    summary:
      "Community comes together for record-breaking blood donation drive at City Convention Center.",
    content:
      "The Annual City Blood Donation Camp has shattered all previous records with over 5000 units of blood collected in just two days. Organizers were overwhelmed by the response, with queues forming before dawn each day. 'This demonstrates the incredible generosity of our community,' said event coordinator Maria Rodriguez. The blood will help save up to 15,000 lives and has been distributed to 12 local hospitals.",
    category: "Community",
    author: "James Wilson",
    date: "March 12, 2026",
    readTime: 4,
    image:
      "https://images.unsplash.com/photo-1581595219315-a187d40c3224?w=800&auto=format",
    likes: 892,
    comments: 67,
    breaking: false,
    featured: true,
  },
  {
    id: 4,
    title: "5 Foods That Naturally Boost Your Hemoglobin Levels",
    summary:
      "Simple dietary changes can help maintain healthy hemoglobin for successful blood donation.",
    content:
      "If you've been deferred from blood donation due to low hemoglobin, these five foods can help boost your levels naturally. Spinach, lentils, red meat, beetroot, and pomegranates are rich in iron and vitamin C, which aids absorption. Nutritionist Dr. Emily Roberts shares meal plans that can increase hemoglobin by 1-2 points within weeks, making you eligible to donate and improving your overall health.",
    category: "Health Tips",
    author: "Dr. Emily Roberts",
    date: "March 10, 2026",
    readTime: 4,
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format",
    likes: 445,
    comments: 32,
    breaking: false,
    featured: false,
  },
  {
    id: 5,
    title: "Young Cancer Patient Finds Match After 3-Year Wait",
    summary:
      "Rare blood type search ends successfully as 12-year-old receives life-saving transfusion.",
    content:
      "After a three-year wait, 12-year-old Maya Sharma has finally received a blood transfusion matching her rare Bombay blood phenotype. The search involved over 10,000 potential donors across the country. 'We never gave up hope,' said her mother. The case has highlighted the critical need for rare blood type registries, and health authorities are now working to expand the national rare donor program.",
    category: "Success Story",
    author: "Priya Patel",
    date: "March 8, 2026",
    readTime: 6,
    image:
      "https://images.unsplash.com/photo-1584515933487-7798245628d7?w=800&auto=format",
    likes: 1243,
    comments: 156,
    breaking: false,
    featured: true,
  },
  {
    id: 6,
    title: "WHO Launches Global Campaign: '30 by 30' for Blood Safety",
    summary:
      "International initiative aims to ensure 30 countries achieve 100% voluntary blood donation by 2030.",
    content:
      "The World Health Organization has launched the ambitious '30 by 30' campaign, targeting 30 countries to achieve 100% voluntary, unpaid blood donation by the year 2030. Currently, only 60 countries have achieved this milestone. The campaign will focus on education, infrastructure, and removing barriers to donation in developing nations. 'Safe blood saves lives, and voluntary donors are the safest source,' said WHO Director-General.",
    category: "Medical Research",
    author: "Dr. Alan Foster",
    date: "March 5, 2026",
    readTime: 5,
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format",
    likes: 678,
    comments: 43,
    breaking: true,
    featured: false,
  },
  {
    id: 7,
    title: "Mobile Blood Donation Units Hit the Road in Rural Areas",
    summary:
      "New fleet of mobile units brings blood donation camps to remote villages.",
    content:
      "A fleet of 20 mobile blood donation units has been deployed to serve rural communities previously hours away from the nearest donation center. Each unit is equipped with modern storage facilities and staffed by trained phlebotomists. In the first month alone, the units have collected over 2,000 units from first-time donors. 'This is a game-changer for rural healthcare,' said Health Minister.",
    category: "Community",
    author: "Robert Chen",
    date: "March 3, 2026",
    readTime: 3,
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format",
    likes: 345,
    comments: 28,
    breaking: false,
    featured: false,
  },
  {
    id: 8,
    title: "Winter Weather Causes Blood Shortage: Donors Urgently Needed",
    summary:
      "Severe winter storms lead to canceled blood drives and critical shortages.",
    content:
      "A series of severe winter storms has forced the cancellation of over 200 blood drives across the northern region, creating a critical blood shortage. Hospitals report less than a one-day supply of some blood types. Emergency management officials are urging eligible donors to visit permanent donation centers as soon as weather permits. 'Every donation can save up to three lives,' said Red Cross officials.",
    category: "Emergency",
    author: "Lisa Thompson",
    date: "February 28, 2026",
    readTime: 3,
    image:
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800&auto=format",
    likes: 567,
    comments: 89,
    breaking: true,
    featured: false,
  },
  {
    id: 9,
    title:
      "Revolutionary Blood Storage Technology Extends Shelf Life to 6 Weeks",
    summary:
      "New preservation method could dramatically improve blood availability in remote areas.",
    content:
      "Scientists have developed a groundbreaking preservation technique that extends the shelf life of red blood cells from 42 days to 6 weeks. The new method uses a combination of antioxidants and specialized storage solutions that slow cellular degradation. This breakthrough could be particularly significant for military medicine, disaster response, and healthcare in remote regions where blood supply logistics are challenging.",
    category: "Medical Research",
    author: "Dr. James Wong",
    date: "February 25, 2026",
    readTime: 5,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format",
    likes: 789,
    comments: 67,
    breaking: false,
    featured: false,
  },
  {
    id: 10,
    title: "Local Teen Organizes Blood Drive for Eagle Scout Project",
    summary:
      "16-year-old's initiative collects 150 units, inspiring other young donors.",
    content:
      "When 16-year-old Alex Martinez needed to complete his Eagle Scout service project, he chose to organize a community blood drive—and the results exceeded all expectations. The event collected 150 units of blood, potentially saving 450 lives. More importantly, Alex recruited 40 first-time donors, mostly fellow students. 'I wanted to do something that would make a real difference,' said Alex. Local Scout councils are now considering making blood drives a standard project option.",
    category: "Success Story",
    author: "Michelle Garcia",
    date: "February 22, 2026",
    readTime: 4,
    image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&auto=format",
    likes: 456,
    comments: 34,
    breaking: false,
    featured: true,
  },
];

// News Card Component
const NewsCard = ({ news, onSave, onShare, onLike }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(news.likes || 0);

  const handleSave = (e) => {
    e.stopPropagation();
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    onSave?.(news.id, newSavedState);
    toast.success(
      newSavedState ? "Saved to reading list" : "Removed from saved",
    );
  };

  const handleLike = (e) => {
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    onLike?.(news.id, newLikedState);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare?.(news);
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Blood Donation": "bg-red-100 text-red-600",
      "Health Tips": "bg-green-100 text-green-600",
      "Medical Research": "bg-blue-100 text-blue-600",
      Community: "bg-purple-100 text-purple-600",
      Emergency: "bg-orange-100 text-orange-600",
      "Success Story": "bg-yellow-100 text-yellow-600",
      "Awareness Campaign": "bg-indigo-100 text-indigo-600",
      "Hospital Updates": "bg-teal-100 text-teal-600",
    };
    return colors[category] || "bg-gray-100 text-gray-600";
  };

  return (
    <div
      onClick={() => navigate(`/news/${news.id}`)}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {news.breaking && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
            BREAKING
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleSave}
            className={`p-2 rounded-full transition-all ${
              isSaved
                ? "bg-red-600 text-white"
                : "bg-white/90 text-gray-600 hover:bg-white"
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(news.category)}`}
          >
            {news.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {news.readTime} min read
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
          {news.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-2">{news.summary}</p>

        {/* Author & Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
              {news.author?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{news.author}</p>
              <p className="text-xs text-gray-500">{news.date}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? "fill-red-600 text-red-600" : ""}`}
            />
            <span className="text-sm">{likesCount}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/news/${news.id}#comments`);
            }}
            className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm">{news.comments || 0}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${window.location.origin}/news/${news.id}`,
                "_blank",
              );
            }}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-400 transition-colors ml-auto"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.637-12.247c.01-.383.003-.762-.02-1.14A9.93 9.93 0 0024 4.59z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Featured News Component
const FeaturedNews = ({ news }) => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[500px] rounded-3xl overflow-hidden group">
      <img
        src={news.image}
        alt={news.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        {news.breaking && (
          <span className="inline-block bg-red-600 px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse">
            🔴 BREAKING NEWS
          </span>
        )}
        <span className="inline-block bg-red-600/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm mb-4">
          {news.category}
        </span>
        <h2 className="text-4xl font-bold mb-4">{news.title}</h2>
        <p className="text-lg text-gray-200 mb-6 max-w-2xl">{news.summary}</p>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(`/news/${news.id}`)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
          >
            Read Full Story
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold">
              {news.author?.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{news.author}</p>
              <p className="text-sm text-gray-300">{news.date}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Sidebar Component
const FilterSidebar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onDateRangeChange,
  onClearFilters,
}) => {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const handleDateChange = (type, value) => {
    const newRange = { ...dateRange, [type]: value };
    setDateRange(newRange);
    onDateRangeChange(newRange);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-red-600" />
          Filters
        </h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Clear all
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCategory === category}
                onChange={() => onCategoryChange(category)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-600">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Date Range</h4>
        <div className="space-y-3">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => handleDateChange("from", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => handleDateChange("to", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Quick Filters</h4>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-red-50 rounded-lg transition-colors">
            📰 Latest News
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-red-50 rounded-lg transition-colors">
            🔥 Most Popular
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-red-50 rounded-lg transition-colors">
            💬 Most Discussed
          </button>
        </div>
      </div>
    </div>
  );
};

// Main News Page Component
const News = () => {
  const [news, setNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState(null);
  const [breakingNews, setBreakingNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [viewMode, setViewMode] = useState("grid");

  const navigate = useNavigate();

  const loadNews = useCallback(async () => {
    setLoading(true);
    const filters = {
      page: currentPage,
      category: selectedCategory,
      from: dateRange.from,
      to: dateRange.to,
      search: searchQuery,
    };

    const data = await newsApi.getAll(filters);
    if (data.news) {
      setNews(data.news);
      setTotalPages(data.totalPages || 3);

      // Set featured news from the first item if available and on first page with no filters
      if (
        currentPage === 1 &&
        !selectedCategory &&
        !dateRange.from &&
        data.news.length > 0
      ) {
        const featured = data.news.find((n) => n.featured) || data.news[0];
        setFeaturedNews(featured);
      }
    }
    setLoading(false);
  }, [currentPage, selectedCategory, dateRange, searchQuery]);

  const loadCategories = async () => {
    const data = await newsApi.getCategories();
    if (data.categories) {
      setCategories(data.categories);
    }
  };

  const loadBreakingNews = async () => {
    const data = await newsApi.getBreakingNews();
    if (data.news) {
      setBreakingNews(data.news);
    }
  };

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  useEffect(() => {
    loadCategories();
    loadBreakingNews();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSaveNews = async (id, saved) => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to save articles");
      navigate("/login");
      return;
    }
    const success = await newsApi.saveNews(id);
    if (success) {
      toast.success(saved ? "Article saved!" : "Article removed from saved");
    } else {
      toast.error("Failed to save article");
    }
  };

  const handleLikeNews = async (id, liked) => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to like articles");
      navigate("/login");
      return;
    }
    const success = await newsApi.likeNews(id);
    if (!success) {
      toast.error(
        liked ? "Failed to unlike article" : "Failed to like article",
      );
    }
  };

  const handleShareNews = (news) => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary,
        url: `${window.location.origin}/news/${news.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/news/${news.id}`,
      );
      toast.success("Link copied to clipboard!");
    }
  };

  const handleExportNews = () => {
    toast.success("Exporting news list...");
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setDateRange({ from: "", to: "" });
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="30"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="20"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6" />
              <span className="text-sm font-medium">BloodConnect News</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Blood Bank News & Updates
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Stay informed about blood donation drives, medical breakthroughs,
              and community stories that inspire change.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news articles..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <div className="bg-red-600 text-white py-2 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
              <span className="bg-white text-red-600 px-2 py-1 rounded text-xs font-bold">
                BREAKING
              </span>
              {breakingNews.map((news) => (
                <button
                  key={news.id}
                  onClick={() => navigate(`/news/${news.id}`)}
                  className="hover:underline"
                >
                  {news.title} •
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onDateRangeChange={setDateRange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {/* Featured News */}
            {featuredNews &&
              currentPage === 1 &&
              !selectedCategory &&
              !dateRange.from && (
                <div className="mb-12">
                  <FeaturedNews news={featuredNews} />
                </div>
              )}

            {/* View Toggle and Actions */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory ? selectedCategory : "Latest News"}
              </h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleExportNews}
                  className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                  title="Export news"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* News Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No news found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6`}
              >
                {news.map((item) => (
                  <NewsCard
                    key={item.id}
                    news={item}
                    onSave={handleSaveNews}
                    onShare={handleShareNews}
                    onLike={handleLikeNews}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg ${
                      currentPage === i + 1
                        ? "bg-red-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Never Miss an Update</h3>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest blood donation news
            and health tips
          </p>
          <form className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default News;
