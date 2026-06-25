import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Heart,
  User,
  Calendar,
  Clock,
  Tag,
  ChevronRight,
  Search,
  Filter,
  Bookmark,
  Share2,
  MessageCircle,
  ThumbsUp,
  Loader2,
  TrendingUp,
  Award,
  Users,
  Globe,
  Mail,
  ArrowRight,
  X,
  Edit,
  Trash2,
  Plus,
  Image,
  Video,
  Link as LinkIcon,
  Eye,
  ThumbsDown,
  Star,
  Sparkles,
  HeartHandshake,
  Droplet,
  Stethoscope,
  Activity,
  ChevronLeft,
  MapPin,
  AlertCircle,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../config/env.js";
import api, { blogApi as blogApiClient, publicApi } from "../../services/api.js";

// Fallback image for blog posts
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format";

// Mock data for random blogs (fallback when API fails)
const MOCK_BLOGS = [
  {
    id: "1",
    title:
      "The Life-Saving Power of Blood Donation: One Pint Can Save Three Lives",
    excerpt:
      "Discover how a single blood donation can have a ripple effect, saving up to three lives and transforming communities.",
    content: "Full content here...",
    category: "Blood Donation",
    readTime: 5,
    likes: 234,
    comments: 45,
    views: 1234,
    date: "2024-03-15",
    coverImage:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format",
    author: {
      name: "Dr. Sarah Johnson",
      role: "Hematologist",
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
    },
  },
  {
    id: "2",
    title: "Understanding Blood Types: Why Your Type Matters in Emergencies",
    excerpt:
      "A comprehensive guide to blood types and why knowing your blood type could be crucial in emergency situations.",
    content: "Full content here...",
    category: "Health & Wellness",
    readTime: 8,
    likes: 189,
    comments: 32,
    views: 987,
    date: "2024-03-12",
    coverImage:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format",
    author: {
      name: "Dr. Michael Chen",
      role: "Immunologist",
      avatar:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop",
    },
  },
  {
    id: "3",
    title:
      "From Donor to Hero: Real Stories of Lives Changed Through Blood Donation",
    excerpt:
      "Heartwarming stories from donors and recipients who share how blood donation transformed their lives.",
    content: "Full content here...",
    category: "Community Stories",
    readTime: 6,
    likes: 567,
    comments: 89,
    views: 2345,
    date: "2024-03-10",
    coverImage:
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format",
    author: {
      name: "Emma Thompson",
      role: "Community Organizer",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    },
  },
  {
    id: "4",
    title: "Breaking Myths: Common Misconceptions About Blood Donation",
    excerpt:
      "Separating fact from fiction: addressing the most common myths that prevent people from donating blood.",
    content: "Full content here...",
    category: "Expert Advice",
    readTime: 4,
    likes: 345,
    comments: 67,
    views: 1567,
    date: "2024-03-08",
    coverImage:
      "https://images.unsplash.com/photo-1631815588090-d1bfbe5e8a58?w=800&auto=format",
    author: {
      name: "Dr. Lisa Rodriguez",
      role: "Medical Director",
      avatar:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop",
    },
  },
  {
    id: "5",
    title: "The Science of Blood: How Your Body Regenerates Donated Blood",
    excerpt:
      "Explore the fascinating science behind blood regeneration and why donating blood is safe and healthy.",
    content: "Full content here...",
    category: "Medical Research",
    readTime: 7,
    likes: 278,
    comments: 41,
    views: 1876,
    date: "2024-03-05",
    coverImage:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b9a?w=800&auto=format",
    author: {
      name: "Prof. James Wilson",
      role: "Research Scientist",
      avatar:
        "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop",
    },
  },
  {
    id: "6",
    title: "My Journey as a Regular Blood Donor: 50 Donations and Counting",
    excerpt:
      "One man's inspiring journey of regular blood donation and how it became a meaningful part of his life.",
    content: "Full content here...",
    category: "Personal Journey",
    readTime: 5,
    likes: 432,
    comments: 78,
    views: 2109,
    date: "2024-03-03",
    coverImage:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format",
    author: {
      name: "Robert Martinez",
      role: "Donor Advocate",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
  },
];

// API Service for Blog
const blogApi = {
  async getAll(filters = {}) {
    try {
      const response = await blogApiClient.getAll(filters);
      if (response.data && response.data.blogs) {
        response.data.blogs = response.data.blogs.map((blog) => ({
          ...blog,
          id: blog._id || blog.id,
        }));
      }
      return response.data;
    } catch (error) {
      console.error("Blog API Error:", error);
      let filteredBlogs = [...MOCK_BLOGS];

      if (filters.category) {
        filteredBlogs = filteredBlogs.filter(
          (blog) => blog.category === filters.category,
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredBlogs = filteredBlogs.filter(
          (blog) =>
            blog.title.toLowerCase().includes(searchLower) ||
            blog.excerpt.toLowerCase().includes(searchLower),
        );
      }

      const page = filters.page || 1;
      const pageSize = 6;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedBlogs = filteredBlogs.slice(start, end);

      return {
        blogs: paginatedBlogs,
        totalPages: Math.ceil(filteredBlogs.length / pageSize),
      };
    }
  },

  async getById(id) {
    try {
      const response = await blogApiClient.getById(id);
      if (response.data) {
        return {
          ...response.data,
          id: response.data._id || response.data.id,
        };
      }
      return null;
    } catch (error) {
      console.error("Blog API Error:", error);
      const blog = MOCK_BLOGS.find((b) => b.id === id);
      return blog || null;
    }
  },

  async getCategories() {
    try {
      const response = await blogApiClient.getCategories();
      return response.data;
    } catch (error) {
      console.error("Blog API Error:", error);
      const categories = [...new Set(MOCK_BLOGS.map((blog) => blog.category))];
      return { categories };
    }
  },

  async getPopular() {
    try {
      const response = await blogApiClient.getPopular();
      if (response.data && response.data.blogs) {
        response.data.blogs = response.data.blogs.map((blog) => ({
          ...blog,
          id: blog._id || blog.id,
        }));
      }
      return response.data;
    } catch (error) {
      console.error("Blog API Error:", error);
      const popular = [...MOCK_BLOGS]
        .sort((a, b) => b.views - a.views)
        .slice(0, 3);
      return { blogs: popular };
    }
  },

  async likeBlog(id) {
    try {
      const response = await api.post(`/blog/${id}/like`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Blog API Error:", error);
      return true;
    }
  },

  async commentOnBlog(id, comment) {
    try {
      const response = await api.post(`/blog/${id}/comment`, { comment });
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Blog API Error:", error);
      return true;
    }
  },

  async saveBlog(id) {
    try {
      const response = await api.post(`/blog/${id}/save`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Blog API Error:", error);
      return true;
    }
  },

  async createBlog(blogData) {
    try {
      const response = await api.post("/blog/create", blogData);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Blog API Error:", error);
      return true;
    }
  },

  async updateBlog(id, blogData) {
    try {
      const response = await api.put(`/blog/${id}`, blogData);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Blog API Error:", error);
      return true;
    }
  },

  async deleteBlog(id) {
    try {
      const response = await api.delete(`/blog/${id}`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Blog API Error:", error);
      return true;
    }
  },
};

// Blog Card Component
const BlogCard = ({
  blog,
  onLike,
  onSave,
  onShare,
  onDelete,
  onEdit,
  isOwner,
}) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likes || 0);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    onLike?.(blog.id);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setSaved(!saved);
    onSave?.(blog.id);
    toast.success(saved ? "Removed from saved" : "Saved to reading list");
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare?.(blog);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(blog);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      onDelete?.(blog.id);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Blood Donation": "bg-red-100 text-red-600",
      "Health & Wellness": "bg-green-100 text-green-600",
      "Medical Research": "bg-blue-100 text-blue-600",
      "Community Stories": "bg-purple-100 text-purple-600",
      "Expert Advice": "bg-yellow-100 text-yellow-600",
      "Personal Journey": "bg-pink-100 text-pink-600",
    };
    return colors[category] || "bg-gray-100 text-gray-600";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Blood Donation": <Droplet className="w-4 h-4" />,
      "Health & Wellness": <Heart className="w-4 h-4" />,
      "Medical Research": <Activity className="w-4 h-4" />,
      "Community Stories": <Users className="w-4 h-4" />,
      "Expert Advice": <Stethoscope className="w-4 h-4" />,
      "Personal Journey": <HeartHandshake className="w-4 h-4" />,
    };
    return icons[category] || <Tag className="w-4 h-4" />;
  };

  return (
    <article
      onClick={() => navigate(`/blog/${blog.id}`)}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={blog.coverImage || FALLBACK_IMAGE}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.target.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {isOwner && (
            <>
              <button
                onClick={handleEdit}
                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <Edit className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            className={`p-2 rounded-full transition-all ${
              saved
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
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {blog.views || 0}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getCategoryColor(blog.category)}`}
          >
            {getCategoryIcon(blog.category)}
            {blog.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {blog.readTime} min read
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
          {blog.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-2">{blog.excerpt}</p>

        {/* Author */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={blog.author.avatar}
              alt={blog.author.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author.name)}&background=random`;
              }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {blog.author.name}
              </p>
              <p className="text-xs text-gray-500">{blog.author.role}</p>
            </div>
          </div>
          <span className="text-xs text-gray-400">{blog.date}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
          >
            <ThumbsUp
              className={`w-4 h-4 ${liked ? "fill-red-600 text-red-600" : ""}`}
            />
            <span className="text-sm">{likesCount}</span>
          </button>
          <button className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{Array.isArray(blog.comments) ? blog.comments.length : (typeof blog.comments === 'number' ? blog.comments : 0)}</span>
          </button>
          <div className="flex items-center gap-1 text-gray-500 ml-auto">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">{blog.views || 0} views</span>
          </div>
        </div>
      </div>
    </article>
  );
};

// Featured Blog Component
const FeaturedBlog = ({ blog }) => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[600px] rounded-3xl overflow-hidden">
      <img
        src={blog.coverImage || FALLBACK_IMAGE}
        alt={blog.title}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = FALLBACK_IMAGE;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

      <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={blog.author.avatar}
            alt={blog.author.name}
            className="w-12 h-12 rounded-full border-2 border-white"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author.name)}&background=random`;
            }}
          />
          <div>
            <p className="font-semibold text-lg">{blog.author.name}</p>
            <p className="text-sm text-gray-300">{blog.author.role}</p>
          </div>
          <span className="ml-auto px-4 py-2 bg-red-600 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="w-4 h-4" />
            Featured
          </span>
        </div>

        <h2 className="text-5xl font-bold mb-4 max-w-3xl">{blog.title}</h2>
        <p className="text-xl text-gray-200 mb-6 max-w-2xl">{blog.excerpt}</p>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(`/blog/${blog.id}`)}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
          >
            Read Full Article
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-300" />
              <span>{blog.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-300" />
              <span>{blog.readTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Blog Editor Modal (for creating/editing blogs)
const BlogEditorModal = ({ isOpen, onClose, blogToEdit, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    excerpt: "",
    coverImage: "",
    tags: [],
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (blogToEdit) {
      setFormData({
        title: blogToEdit.title || "",
        content: blogToEdit.content || "",
        category: blogToEdit.category || "",
        excerpt: blogToEdit.excerpt || "",
        coverImage: blogToEdit.coverImage || "",
        tags: blogToEdit.tags || [],
        published: blogToEdit.published || false,
      });
    } else {
      setFormData({
        title: "",
        content: "",
        category: "",
        excerpt: "",
        coverImage: "",
        tags: [],
        published: false,
      });
    }
    setStep(1);
  }, [blogToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let success;
      if (blogToEdit) {
        success = await blogApi.updateBlog(blogToEdit.id, formData);
      } else {
        success = await blogApi.createBlog(formData);
      }

      if (success) {
        toast.success(
          blogToEdit
            ? "Blog updated successfully!"
            : "Blog created successfully!",
        );
        onSave?.();
        onClose();
      } else {
        toast.error("Failed to save blog");
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {blogToEdit ? "Edit Blog" : "Create New Blog"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 text-center ${
                  step >= s ? "text-red-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    step >= s ? "bg-red-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {s}
                </div>
                <span className="text-sm">
                  {s === 1 ? "Basic Info" : s === 2 ? "Content" : "Publish"}
                </span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blog Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                  placeholder="Enter an engaging title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Blood Donation">Blood Donation</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Medical Research">Medical Research</option>
                  <option value="Community Stories">Community Stories</option>
                  <option value="Expert Advice">Expert Advice</option>
                  <option value="Personal Journey">Personal Journey</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt/Summary *
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                  placeholder="Brief summary of your blog post"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blog Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 font-mono"
                  required
                  placeholder="Write your blog content here... (Markdown supported)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="blood donation, health, wellness"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Tip: Use markdown for formatting. Headers with #, lists with
                  -, and links with [text](url)
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  {formData.coverImage && (
                    <img
                      src={formData.coverImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {formData.title || "Blog Title"}
                  </h4>
                  <p className="text-gray-600 mb-2">
                    {formData.excerpt || "Blog excerpt will appear here..."}
                  </p>
                  <div className="text-sm text-gray-500">
                    Category: {formData.category || "Not selected"} | Tags:{" "}
                    {formData.tags.join(", ") || "None"}
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData({ ...formData, published: e.target.checked })
                    }
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">
                    Publish immediately
                  </span>
                </label>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  By publishing, you agree to our content guidelines and confirm
                  that this is original content.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="ml-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="ml-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {blogToEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {blogToEdit ? "Update Blog" : "Publish Blog"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const Blog = () => {
  const { id } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [popularBlogs, setPopularBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  // Params Detail State
  const [currentBlog, setCurrentBlog] = useState(null);
  const [blogLoading, setBlogLoading] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // Real-time Sidebar requests
  const [liveRequests, setLiveRequests] = useState([]);

  const hasSetFeaturedRef = useRef(false);
  const navigate = useNavigate();

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribing(true);
    try {
      const response = await publicApi.subscribeNewsletter(newsletterEmail);
      if (response && response.data) {
        toast.success(response.data.message || "Successfully subscribed to newsletter!");
        setNewsletterEmail("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Subscription failed. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    const filters = {
      page: currentPage,
      category: selectedCategory,
      search: searchQuery,
    };

    const data = await blogApi.getAll(filters);
    if (data.blogs) {
      setBlogs(data.blogs);
      setTotalPages(data.totalPages || 1);

      // Calculate stats
      const totalViews = data.blogs.reduce(
        (sum, blog) => sum + (blog.views || 0),
        0,
      );
      const totalLikes = data.blogs.reduce(
        (sum, blog) => sum + (blog.likes || 0),
        0,
      );
      const totalComments = data.blogs.reduce(
        (sum, blog) => sum + (Array.isArray(blog.comments) ? blog.comments.length : (typeof blog.comments === 'number' ? blog.comments : 0)),
        0,
      );

      setStats({
        totalBlogs: data.blogs.length,
        totalViews,
        totalLikes,
        totalComments,
      });

      // Only set featured blog if it hasn't been set yet and we have blogs
      if (
        data.blogs.length > 0 &&
        !hasSetFeaturedRef.current &&
        currentPage === 1 &&
        !selectedCategory
      ) {
        setFeaturedBlog(data.blogs[0]);
        hasSetFeaturedRef.current = true;
      }
    }
    setLoading(false);
  }, [currentPage, selectedCategory, searchQuery]);

  const loadCategories = useCallback(async () => {
    const data = await blogApi.getCategories();
    if (data.categories) {
      setCategories(data.categories);
    }
  }, []);

  const loadPopularBlogs = useCallback(async () => {
    const data = await blogApi.getPopular();
    if (data.blogs) {
      setPopularBlogs(data.blogs);
    }
  }, []);

  const checkUserRole = useCallback(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }
  }, []);

  // Load single blog detail
  const loadBlogDetail = useCallback(async () => {
    if (!id) return;
    setBlogLoading(true);
    try {
      const blogData = await blogApi.getById(id);
      if (blogData) {
        const mappedBlog = {
          ...blogData,
          id: blogData._id || blogData.id
        };
        setCurrentBlog(mappedBlog);
        setCommentsList(Array.isArray(mappedBlog.comments) ? mappedBlog.comments : []);
      } else {
        toast.error("Blog post not found");
        navigate("/blog");
      }
    } catch (error) {
      console.error("Failed to load blog detail:", error);
      toast.error("Error loading blog details");
    } finally {
      setBlogLoading(false);
    }
  }, [id, navigate]);

  // Load live requests
  const fetchLiveRequests = async () => {
    try {
      const res = await publicApi.getBloodRequests({ status: "active" });
      if (res.data?.requests) {
        setLiveRequests(res.data.requests.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load requests:", error);
    }
  };

  useEffect(() => {
    loadBlogs();
    loadCategories();
    loadPopularBlogs();
    checkUserRole();
    fetchLiveRequests();
  }, [loadBlogs, loadCategories, loadPopularBlogs, checkUserRole]);

  useEffect(() => {
    if (id) {
      loadBlogDetail();
    } else {
      setCurrentBlog(null);
    }
  }, [id, loadBlogDetail]);

  // Real-time socket connections
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("new-blood-request", (newReq) => {
      setLiveRequests((prev) => {
        if (prev.find((r) => r._id === newReq._id)) return prev;
        return [newReq, ...prev].slice(0, 3);
      });
      toast.success(`🩸 Live: New blood request for ${newReq.bloodType} in ${newReq.city}!`);
    });

    socket.on("blog-feed-updated", () => {
      loadBlogs();
      loadPopularBlogs();
    });

    socket.on("blog-updated", (updatedInfo) => {
      if (id && updatedInfo.id === id) {
        if (updatedInfo.likes !== undefined) {
          setCurrentBlog((prev) => prev ? { ...prev, likes: updatedInfo.likes } : null);
        }
        if (updatedInfo.comments !== undefined) {
          setCommentsList(Array.isArray(updatedInfo.comments) ? updatedInfo.comments : []);
        }
      }
    });

    socket.on("new-blog-post", (newBlog) => {
      toast.success(`📰 New Blog Post: "${newBlog.title}" just published!`);
    });

    return () => {
      socket.disconnect();
    };
  }, [id, loadBlogs, loadPopularBlogs]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem("token")) {
      toast.error("Please login to comment");
      navigate("/login");
      return;
    }
    if (!newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await api.post(`/blog/${id}/comment`, { comment: newCommentText });
      if (response.status >= 200 && response.status < 300) {
        toast.success("Comment added!");
        setNewCommentText("");
        const updatedBlog = await blogApi.getById(id);
        if (updatedBlog) {
          setCommentsList(Array.isArray(updatedBlog.comments) ? updatedBlog.comments : []);
        }
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error adding comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDetailLike = async () => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to like this post");
      navigate("/login");
      return;
    }
    const success = await blogApi.likeBlog(id);
    if (success) {
      setIsLiked(true);
      toast.success("You liked this post!");
      const updatedBlog = await blogApi.getById(id);
      if (updatedBlog && currentBlog) {
        setCurrentBlog(prev => prev ? { ...prev, likes: updatedBlog.likes } : null);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    hasSetFeaturedRef.current = false;
    loadBlogs();
  };

  const handleLike = async (id) => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to like blogs");
      navigate("/login");
      return;
    }

    const success = await blogApi.likeBlog(id);
    if (success) {
      toast.success("Blog liked successfully!");
      loadBlogs(); // Refresh to show updated like count
    } else {
      toast.error("Failed to like blog");
    }
  };

  const handleSave = async (id) => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to save blogs");
      navigate("/login");
      return;
    }

    const success = await blogApi.saveBlog(id);
    if (success) {
      toast.success("Blog saved successfully!");
    } else {
      toast.error("Failed to save blog");
    }
  };

  const handleShare = (blog) => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: `${window.location.origin}/blog/${blog.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/blog/${blog.id}`,
      );
      toast.success("Link copied to clipboard!");
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setShowEditor(true);
  };

  const handleDelete = async (id) => {
    const success = await blogApi.deleteBlog(id);
    if (success) {
      toast.success("Blog deleted successfully!");
      loadBlogs();
      loadPopularBlogs();
    } else {
      toast.error("Failed to delete blog");
    }
  };

  const handleEditorSave = () => {
    loadBlogs();
    loadPopularBlogs();
    setEditingBlog(null);
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingBlog(null);
  };

  const canCreateBlog = () => {
    return (
      userRole === "admin" || userRole === "bloodlab" || userRole === "hospital"
    );
  };

  const isOwner = (blog) => {
    // Check if current user is the author
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return userRole === "admin" || blog.author.name === user.username;
      } catch (error) {
        console.error("Error parsing user:", error);
        return false;
      }
    }
    return false;
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setCurrentPage(1);
    hasSetFeaturedRef.current = false;
  };

  if (id) {
    if (blogLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
          <Header />
          <div className="flex-grow flex items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          </div>
          <Footer />
        </div>
      );
    }

    if (!currentBlog) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
          <Header />
          <div className="flex-grow flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Post Not Found</h2>
            <button
              onClick={() => navigate("/blog")}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Back to Blog
            </button>
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
        <Header />
        
        {/* Blog Detail Header */}
        <section className="relative pt-24 pb-12 bg-gradient-to-br from-slate-900 to-gray-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src={currentBlog.coverImage || FALLBACK_IMAGE}
              alt={currentBlog.title}
              className="w-full h-full object-cover blur-sm"
              onError={(e) => {
                e.target.src = FALLBACK_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <button
              onClick={() => navigate("/blog")}
              className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-medium mb-6 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Blog
            </button>
            <div className="mb-4">
              <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-semibold uppercase tracking-wider">
                {currentBlog.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-4 mb-6 leading-tight text-white">
              {currentBlog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <img
                  src={currentBlog.author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                  alt={currentBlog.author?.name}
                  className="w-10 h-10 rounded-full border border-gray-700 object-cover"
                />
                <div>
                  <p className="font-semibold text-white">{currentBlog.author?.name}</p>
                  <p className="text-xs text-gray-400">{currentBlog.author?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-red-500" />
                {new Date(currentBlog.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-red-500" />
                {currentBlog.readTime} min read
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-red-500" />
                {currentBlog.views} views
              </div>
            </div>
          </div>
        </section>

        {/* Blog content and sidebar layout */}
        <div className="container mx-auto px-4 py-12 max-w-7xl flex-grow">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Article Content */}
            <div className="lg:w-3/4 bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100">
              <article className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
                <div className="whitespace-pre-wrap text-base md:text-lg">
                  {currentBlog.content}
                </div>
              </article>

              {/* Likes and Share */}
              <div className="flex items-center justify-between border-t border-b border-gray-100 py-6 my-8">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDetailLike}
                    disabled={isLiked}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                      isLiked
                        ? "bg-red-50 text-red-600 border border-red-200 cursor-default"
                        : "bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-100"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-red-600 text-red-600" : ""}`} />
                    {currentBlog.likes} Likes
                  </button>
                  <button
                    onClick={() => handleShare(currentBlog)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {currentBlog.tags?.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-red-600" />
                  Comments ({commentsList.length})
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <textarea
                    rows={4}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Join the discussion... Share your thoughts."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none mb-3"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-sm flex items-center gap-2 disabled:opacity-60"
                  >
                    {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Post Comment
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {commentsList.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No comments yet. Be the first to share your opinion!</p>
                  ) : (
                    commentsList.map((c, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(c.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                        <p className="text-gray-600 text-sm">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar with Live Needs */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-600 animate-pulse" />
                  Live Urgent Needs
                </h3>
                <div className="space-y-3">
                  {liveRequests.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No active urgent requests</p>
                  ) : (
                    liveRequests.map((req) => (
                      <div
                        key={req._id}
                        onClick={() => navigate("/blood-request")}
                        className="p-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl cursor-pointer transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="px-2 py-0.5 bg-red-600 text-white font-bold text-xs rounded-full">
                            {req.bloodType}
                          </span>
                          <span className="text-[10px] text-red-600 uppercase font-bold tracking-wider animate-pulse">
                            {req.urgency}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-red-700">
                          {req.patientName} ({req.units} Units)
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {req.hospital}, {req.city}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Popular posts block */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                    Popular Posts
                  </h3>
                  <div className="space-y-3">
                    {popularBlogs.map((b) => (
                      <div
                        key={b.id || b._id}
                        onClick={() => navigate(`/blog/${b.id || b._id}`)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={b.coverImage || FALLBACK_IMAGE}
                          alt={b.title}
                          className="w-14 h-14 rounded-xl object-cover"
                          onError={(e) => {
                            e.target.src = FALLBACK_IMAGE;
                          }}
                        />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-red-600">
                            {b.title}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{b.readTime} min read</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Header />

      {/* Blog Editor Modal */}
      <BlogEditorModal
        isOpen={showEditor}
        onClose={handleEditorClose}
        blogToEdit={editingBlog}
        onSave={handleEditorSave}
      />

      {/* Hero Section */}
      <section className="relative pt-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0 0 L100 100 M100 0 L0 100"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">LifeDrop Blog</h1>
            <p className="text-xl opacity-90 mb-8">
              Insights, stories, and expert advice about blood donation, health,
              and community impact.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl group">
              <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-transparent group-focus-within:border-red-500/30 group-focus-within:ring-4 group-focus-within:ring-red-500/10 transition-all duration-300">
                <Search className="absolute left-4 text-gray-400 w-5 h-5 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blog posts..."
                  className="w-full pl-12 pr-32 py-4 bg-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none text-base"
                />
                
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                      hasSetFeaturedRef.current = false;
                      setTimeout(() => loadBlogs(), 10);
                    }}
                    className="absolute right-28 p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="absolute right-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-red-500/10 hover:shadow-red-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </form>

            {/* Create Blog Button (for authorized users) */}
            {canCreateBlog() && (
              <button
                onClick={() => {
                  setEditingBlog(null);
                  setShowEditor(true);
                }}
                className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Write a Blog Post
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {stats.totalBlogs}
              </p>
              <p className="text-sm text-gray-600">Total Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {stats.totalViews.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {stats.totalLikes.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Likes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {stats.totalComments.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Comments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-red-600" />
                Categories
              </h3>

              <div className="space-y-2 mb-6">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentPage(1);
                    hasSetFeaturedRef.current = false;
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory
                      ? "bg-red-50 text-red-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  All Posts
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                      hasSetFeaturedRef.current = false;
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? "bg-red-50 text-red-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Live Urgent Requests Widget */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-600 animate-pulse" />
                  Live Urgent Needs
                </h3>
                <div className="space-y-3">
                  {liveRequests.length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center">No active urgent requests</p>
                  ) : (
                    liveRequests.map((req) => (
                      <div
                        key={req._id}
                        onClick={() => navigate("/blood-request")}
                        className="p-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl cursor-pointer transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="px-2 py-0.5 bg-red-600 text-white font-bold text-xs rounded-full">
                            {req.bloodType}
                          </span>
                          <span className="text-[10px] text-red-600 uppercase font-bold tracking-wider animate-pulse">
                            {req.urgency}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-red-700">
                          {req.patientName} ({req.units} Units)
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {req.hospital}, {req.city}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Popular Posts */}
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Popular Posts
              </h3>

              <div className="space-y-4">
                {popularBlogs.slice(0, 3).map((blog) => (
                  <button
                    key={blog.id}
                    onClick={() => navigate(`/blog/${blog.id}`)}
                    className="flex gap-3 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <img
                      src={blog.coverImage || FALLBACK_IMAGE}
                      alt={blog.title}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {blog.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {blog.views} views
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Newsletter Signup */}
              <form onSubmit={handleNewsletterSubmit} className="mt-6 p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-red-600" />
                  Subscribe to Blog
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Get the latest posts delivered to your inbox
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={subscribing}
                    placeholder="Your email"
                    required
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                  >
                    {subscribing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>

              {/* Active Filters */}
              {(selectedCategory || searchQuery) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Active Filters:</p>
                  {selectedCategory && (
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">
                        Category: {selectedCategory}
                      </span>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {searchQuery && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Search: "{searchQuery}"</span>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {/* Featured Blog */}
            {featuredBlog &&
              currentPage === 1 &&
              !selectedCategory &&
              !searchQuery && (
                <div className="mb-12">
                  <FeaturedBlog blog={featuredBlog} />
                </div>
              )}

            {/* Blog Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No blog posts found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedCategory
                    ? "Try adjusting your search or filter"
                    : "Be the first to share your story!"}
                </p>
                {canCreateBlog() && (
                  <button
                    onClick={() => {
                      setEditingBlog(null);
                      setShowEditor(true);
                    }}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Write the first blog post →
                  </button>
                )}
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={clearFilters}
                    className="ml-4 text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results info */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Showing {blogs.length} of {stats.totalBlogs} posts
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                </div>

                {/* Blog grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {blogs.map((blog) => (
                    <BlogCard
                      key={blog.id}
                      blog={blog}
                      onLike={handleLike}
                      onSave={handleSave}
                      onShare={handleShare}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isOwner={isOwner(blog)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
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
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
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

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Share Your Story</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Have an experience or insight to share? Join our community of
            writers and help inspire others.
          </p>
          {canCreateBlog() ? (
            <button
              onClick={() => {
                setEditingBlog(null);
                setShowEditor(true);
              }}
              className="bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Write a Blog Post
            </button>
          ) : (
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              Join as a Writer
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
