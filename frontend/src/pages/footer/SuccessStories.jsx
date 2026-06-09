import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Share2,
  Filter,
  Search,
  Calendar,
  MapPin,
  Droplet,
  Users,
  Award,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Download,
  Printer,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  Clock,
  Activity,
  Shield,
  ThumbsUp,
  MessageCircle,
  Star,
  TrendingUp,
  Globe,
  Phone,
  FileText,
  Video,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Sample Data with real image URLs
const successStoriesData = [
  {
    id: 1,
    title: "A Father's Second Chance at Life",
    subtitle: "Emergency Open Heart Surgery",
    donor: {
      name: "Rahul Sharma",
      age: 32,
      location: "Mumbai, Maharashtra",
      bloodGroup: "O+",
      donorSince: "2018",
      totalDonations: 24,
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      quote: "Knowing I could save a life is the greatest feeling ever.",
    },
    recipient: {
      name: "Arun Mehta",
      age: 58,
      location: "Mumbai, Maharashtra",
      condition: "Heart Valve Replacement",
      relationship: "Stranger turned family",
      story:
        "Arun was diagnosed with severe aortic stenosis and needed immediate surgery. With no family matches available, the hospital put out an emergency call for O+ blood donors.",
    },
    hospital: {
      name: "Lilavati Hospital & Research Centre",
      location: "Mumbai",
      doctor: "Dr. Priya Singh",
    },
    stats: {
      bloodUnits: 4,
      livesImpacted: 12,
      surgeryDate: "2024-01-15",
      recoveryTime: "3 months",
    },
    media: {
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Hospital surgery
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Doctor consultation
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Patient recovery
      ],
      video: "https://example.com/video1",
      testimonial: "https://example.com/testimonial1",
    },
    story: `When 58-year-old Arun Mehta was diagnosed with severe aortic stenosis, his family's world turned upside down. The complex heart surgery required multiple blood transfusions, but with a rare blood type and high demand, finding donors became a race against time.

    Rahul Sharma, a regular donor from BloodConnect, received the emergency alert on his phone at 2 AM. Without hesitation, he rushed to the hospital. His timely donation, along with three other donors mobilized through our platform, enabled the 6-hour surgery to proceed successfully.

    Today, Arun is back to his favorite hobby - gardening, and both families share an unbreakable bond.`,
    impact:
      "This single surgery saved not just Arun, but supported his entire family of 5 members, preventing a devastating loss.",
    featured: true,
    likes: 1542,
    shares: 389,
    comments: 127,
  },
  {
    id: 2,
    title: "From Blood Donor to Bone Marrow Match",
    subtitle: "A Life-Saving Stem Cell Transplant",
    donor: {
      name: "Priya Patel",
      age: 28,
      location: "Ahmedabad, Gujarat",
      bloodGroup: "B+",
      donorSince: "2019",
      totalDonations: 18,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      quote: "Registering as a donor was easy. Saving a life was priceless.",
    },
    recipient: {
      name: "Little Kavya",
      age: 7,
      location: "Delhi NCR",
      condition: "Acute Lymphoblastic Leukemia",
      relationship: "Complete match found through registry",
      story:
        "7-year-old Kavya was fighting leukemia and needed an urgent stem cell transplant. With no matches in her family, the only hope was finding an unrelated donor.",
    },
    hospital: {
      name: "Medanta - The Medicity",
      location: "Gurugram",
      doctor: "Dr. Rajesh Kumar",
    },
    stats: {
      bloodUnits: 8,
      livesImpacted: 25,
      surgeryDate: "2024-02-20",
      recoveryTime: "6 months",
    },
    media: {
      images: [
        "https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Children's hospital
        "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Medical research
        "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Happy child
      ],
      video: "https://example.com/video2",
    },
    story: `When Kavya was diagnosed with leukemia, her parents faced the daunting reality that only a stem cell transplant could save her. The chance of finding an unrelated match was 1 in 100,000.

    Priya, who had registered as both a blood and stem cell donor, got the call that changed two lives forever. She was a perfect 10/10 match for Kavya. The donation process was smooth, and within weeks, Kavya's body accepted the new stem cells.

    Today, Kavya is cancer-free and dreams of becoming a doctor. Priya visits her every year on her "rebirth day."`,
    impact:
      "Kavya's successful treatment has inspired 5,000+ new stem cell registrations in Gujarat alone.",
    featured: true,
    likes: 2341,
    shares: 678,
    comments: 245,
  },
  {
    id: 3,
    title: "Emergency: Rare Blood Type Saves Mother of Twins",
    subtitle: "Post-Partum Hemorrhage Emergency",
    donor: {
      name: "Col. Satish Nair",
      age: 45,
      location: "Pune, Maharashtra",
      bloodGroup: "AB-",
      donorSince: "2005",
      totalDonations: 42,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      quote:
        "In the army, we're taught to serve. This was my moment of service.",
    },
    recipient: {
      name: "Meera Krishnan",
      age: 34,
      location: "Pune, Maharashtra",
      condition: "Post-partum hemorrhage",
      relationship: "Emergency responder",
      story:
        "After delivering twins, Meera developed severe hemorrhage and needed 6 units of rare AB- blood immediately.",
    },
    hospital: {
      name: "Jehangir Hospital",
      location: "Pune",
      doctor: "Dr. Sneha Deshmukh",
    },
    stats: {
      bloodUnits: 6,
      livesImpacted: 4,
      surgeryDate: "2024-03-10",
      recoveryTime: "2 months",
    },
    media: {
      images: [
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Mother and baby
        "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Newborn twins
        "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Happy family
      ],
    },
    story: `Meera's joy of becoming a mother to twins turned into a nightmare when severe bleeding started hours after delivery. With only 2 units of AB- blood in the hospital bank, an SOS was sent out.

    Colonel Nair, who maintains a strict fitness regimen, was at the gym when he received the alert. He reached the hospital within 30 minutes. His donation, along with two other donors mobilized through our network, provided the 6 units needed to stabilize Meera.

    The twins, now thriving, have their grandfather's name and their donor's spirit.`,
    impact:
      "This emergency led to Pune's first 'Rare Blood Donor Registry' with 150+ registered rare blood donors.",
    featured: false,
    likes: 987,
    shares: 234,
    comments: 89,
  },
  {
    id: 4,
    title: "Annual Blood Drive: 10,000 Lives Saved",
    subtitle: "Corporate Social Responsibility Success",
    donor: {
      name: "TCS Employees",
      age: "Collective",
      location: "Pan India",
      bloodGroup: "All Types",
      donorSince: "2020",
      totalDonations: 15000,
      avatar:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      quote: "Our employees show up every time. It's part of our culture.",
    },
    recipient: {
      name: "Thalassemia Warriors",
      age: "Children (5-15)",
      location: "Multiple Cities",
      condition: "Thalassemia Major",
      relationship: "Regular transfusion recipients",
      story:
        "Children with Thalassemia need blood transfusions every 3-4 weeks to survive.",
    },
    hospital: {
      name: "Multiple Partner Hospitals",
      location: "12 Cities",
      doctor: "Dr. Anjali Gupta",
    },
    stats: {
      bloodUnits: 15000,
      livesImpacted: 10000,
      driveDate: "2024-04-05",
      duration: "2 weeks",
    },
    media: {
      images: [
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      video: "https://example.com/video4",
    },
    story: `What started as a small initiative in Mumbai has become India's largest corporate blood donation drive. TCS, in partnership with BloodConnect, organized a 2-week mega drive across 45 cities.

    With 15,000 units collected, this single drive supplies blood for 10,000 thalassemia children for a full month. Employees not only donated but also volunteered, creating a movement that has spread to 200+ other corporations.`,
    impact:
      "Inspired the 'Corporate Blood Champions' program, now adopted by 50+ Fortune India companies.",
    featured: true,
    likes: 5678,
    shares: 1234,
    comments: 456,
  },
];

// Add more stories to reach the count of 156
for (let i = 5; i <= 156; i++) {
  const gender = i % 2 === 0 ? "male" : "female";
  const maleImages = [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
  ];

  const femaleImages = [
    "https://images.unsplash.com/photo-1494790108777-4fd3bea5e8b2",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  ];

  successStoriesData.push({
    id: i,
    title: `Inspiring Story #${i}: A Life Saved Through Blood Donation`,
    subtitle: "Regular Blood Donation Saves Lives",
    donor: {
      name: `Donor ${i}`,
      age: 25 + (i % 30),
      location: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"][i % 5],
      bloodGroup: ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"][i % 8],
      donorSince: "2020",
      totalDonations: 5 + (i % 20),
      avatar:
        gender === "male"
          ? maleImages[i % maleImages.length] +
            "?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
          : femaleImages[i % femaleImages.length] +
            "?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      quote: "Every donation counts. You never know whose life you might save.",
    },
    recipient: {
      name: `Recipient ${i}`,
      age: 30 + (i % 50),
      location: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"][i % 5],
      condition: ["Surgery", "Accident", "Disease", "Childbirth"][i % 4],
      relationship: "Grateful recipient",
      story: "This person's life was saved through timely blood donation.",
    },
    hospital: {
      name: ["Apollo Hospital", "Fortis Healthcare", "Max Hospital", "AIIMS"][
        i % 4
      ],
      location: ["Mumbai", "Delhi", "Bangalore"][i % 3],
      doctor: `Dr. ${["Sharma", "Patel", "Singh", "Kumar"][i % 4]}`,
    },
    stats: {
      bloodUnits: 1 + (i % 5),
      livesImpacted: 1 + (i % 10),
      surgeryDate: "2024-01-01",
      recoveryTime: "Varies",
    },
    media: {
      images: [
        "https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
    },
    story: `This is an inspiring story of how blood donation saved a life. The donor selflessly came forward to help someone in need, demonstrating the true spirit of humanity.`,
    impact: "This donation saved multiple lives and inspired others to donate.",
    featured: i % 5 === 0,
    likes: 100 + i * 50,
    shares: 20 + i * 10,
    comments: 10 + i * 5,
  });
}

const categories = [
  {
    id: "all",
    name: "All Stories",
    icon: Heart,
    count: successStoriesData.length,
  },
  { id: "emergency", name: "Emergency Saves", icon: Activity, count: 60 },
  { id: "rare-blood", name: "Rare Blood", icon: Droplet, count: 17 },
  { id: "pediatric", name: "Children Saved", icon: Users, count: 47 },
  { id: "corporate", name: "Corporate Drives", icon: TrendingUp, count: 22 },
  { id: "stem-cell", name: "Stem Cell", icon: Shield, count: 10 },
];

// Rest of the component remains exactly the same...
const SuccessStories = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStory, setSelectedStory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [storiesPerPage] = useState(6);
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Simulate loading when changing filters or searching
  useEffect(() => {
    const loadStories = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    };

    loadStories();
  }, [selectedCategory, searchQuery, sortBy]);

  // Filter stories based on category and search
  const filteredStories = successStoriesData.filter((story) => {
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "emergency" &&
        story.title.toLowerCase().includes("emergency")) ||
      (selectedCategory === "rare-blood" &&
        story.donor.bloodGroup.includes("-")) ||
      (selectedCategory === "pediatric" && story.recipient.age < 18) ||
      (selectedCategory === "corporate" && story.donor.name.includes("TCS")) ||
      (selectedCategory === "stem-cell" &&
        story.title.toLowerCase().includes("stem cell"));

    const matchesSearch =
      searchQuery === "" ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.story.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Sort stories
  const sortedStories = [...filteredStories].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.stats.surgeryDate) - new Date(a.stats.surgeryDate);
    } else if (sortBy === "popular") {
      return b.likes - a.likes;
    } else if (sortBy === "impact") {
      return b.stats.livesImpacted - a.stats.livesImpacted;
    }
    return 0;
  });

  // Pagination
  const indexOfLastStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfLastStory - storiesPerPage;
  const currentStories = sortedStories.slice(
    indexOfFirstStory,
    indexOfLastStory,
  );
  const totalPages = Math.ceil(sortedStories.length / storiesPerPage);

  // Featured story (first one in the list that's featured)
  const featuredStory = successStoriesData.find((story) => story.featured);

  // Handle story click
  const handleStoryClick = (story) => {
    setSelectedStory(story);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStory(null);
    document.body.style.overflow = "unset";
  };

  // Handle share
  const handleShare = async (platform, story) => {
    const url = `${window.location.origin}/success-stories/${story.id}`;
    const text = `Check out this inspiring success story: ${story.title}`;

    try {
      if (platform === "copy") {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Social sharing URLs
        const shareUrls = {
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          mail: `mailto:?subject=${encodeURIComponent("Inspiring Success Story")}&body=${encodeURIComponent(text + "\n\n" + url)}`,
        };

        if (platform === "print") {
          window.print();
        } else {
          window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
        }
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share. Please try again.");
    }
  };

  // Handle download story as PDF
const handleDownload = (story) => {
  setIsLoading(true);
  toast.success(`Preparing PDF for "${story.title}"...`);
  
  // Simulate PDF generation with the story data
  setTimeout(() => {
    console.log("Generating PDF for story:", {
      id: story.id,
      title: story.title,
      donor: story.donor.name,
      recipient: story.recipient.name
    });
    
    setIsLoading(false);
    toast.success("PDF downloaded successfully!");
  }, 1500);
  
  // In production, you would implement actual PDF generation here
  // Example:
  // const pdfContent = generatePDFContent(story);
  // downloadPDF(pdfContent, `story-${story.id}.pdf`);
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1579154204601-01588f822e49?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Blood donation background"
            className="w-full h-full object-cover mix-blend-overlay opacity-10"
          />
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">
                {successStoriesData.length} Lives Saved & Counting
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Stories of Hope & <span className="text-yellow-300">Heroism</span>
            </h1>

            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Every drop of blood tells a story of courage, compassion, and
              second chances. Read the inspiring journeys of our donors and
              recipients.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mt-12">
              {[
                { label: "Lives Saved", value: "15,678", icon: Heart },
                { label: "Active Donors", value: "25K+", icon: Users },
                { label: "Partner Hospitals", value: "500+", icon: Globe },
                { label: "Cities Covered", value: "156", icon: MapPin },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-red-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 112C120 104 240 88 360 80C480 72 600 72 720 76C840 80 960 88 1080 96C1200 104 1320 112 1380 116L1440 120V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Search and Filter Bar */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="w-full lg:w-auto flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search stories by name, location, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
              </div>

              {/* Sort and Filter Controls */}
              <div className="flex gap-3 w-full lg:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200"
                >
                  <option value="latest">Latest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="impact">Highest Impact</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden md:inline">Filters</span>
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mt-6">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? "bg-red-600 text-white shadow-lg scale-105"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                    <span
                      className={`text-xs ${
                        selectedCategory === category.id
                          ? "text-red-200"
                          : "text-gray-400"
                      }`}
                    >
                      ({category.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stories Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-red-600" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onClick={() => handleStoryClick(story)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-300 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-300 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Featured Story Highlight */}
      {featuredStory && (
        <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold mb-4">
                Featured Story
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Story of the Month
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                This month's most inspiring journey of hope and humanity
              </p>
            </div>

            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-auto">
                  <img
                    src={featuredStory.media.images[0]}
                    alt={featuredStory.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplet className="w-5 h-5 text-red-400" />
                      <span className="text-sm font-medium">
                        {featuredStory.donor.bloodGroup}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold">
                      {featuredStory.title}
                    </h3>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <img
                      src={featuredStory.donor.avatar}
                      alt={featuredStory.donor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {featuredStory.donor.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Donor • {featuredStory.donor.totalDonations} donations
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {featuredStory.story}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {featuredStory.stats.bloodUnits}
                      </div>
                      <div className="text-xs text-gray-500">Units Donated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {featuredStory.stats.livesImpacted}
                      </div>
                      <div className="text-xs text-gray-500">
                        Lives Impacted
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {featuredStory.likes}
                      </div>
                      <div className="text-xs text-gray-500">Reactions</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStoryClick(featuredStory)}
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    Read Full Story
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Be the Next Hero</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of donors who've already made a difference. Your
            story could be next.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register/donor")}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Become a Donor
            </button>
            <button
              onClick={() => navigate("/camps")}
              className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 rounded-xl font-semibold transition-all"
            >
              Find Donation Camps
            </button>
          </div>
        </div>
      </section>

      {/* Story Detail Modal */}
      {isModalOpen && selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          onClose={closeModal}
          onShare={handleShare}
          onDownload={handleDownload}
          copied={copied}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};;;

// Story Card Component
const StoryCard = ({ story, onClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
        return "Date not available";
        }
        return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        });
    } catch (error) {
        console.error("Date formatting error:", error);
        return "Date not available";
    }
    };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={story.media.images[0]}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
            {story.donor.bloodGroup}
          </span>
          {story.featured && (
            <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Subtitle */}
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
          {story.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{story.subtitle}</p>

        {/* Donor Info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={story.donor.avatar}
            alt={story.donor.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900">{story.donor.name}</p>
            <p className="text-xs text-gray-500">
              Donor • {story.donor.location}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">
              {story.stats.bloodUnits}
            </div>
            <div className="text-xs text-gray-500">Units</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">
              {story.stats.livesImpacted}
            </div>
            <div className="text-xs text-gray-500">Lives</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">
              {formatDate(story.stats.surgeryDate)}
            </div>
            <div className="text-xs text-gray-500">Date</div>
          </div>
        </div>

        {/* Story Preview */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {story.story.substring(0, 100)}...
        </p>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {story.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {story.comments}
            </span>
          </div>
          <span className="flex items-center gap-1 text-red-600">
            Read More
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
};

// Story Detail Modal Component
const StoryDetailModal = ({
  story,
  onClose,
  onShare,
  onDownload,
  copied,
  isLoading, // This is causing the warning
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Show loading state if isLoading is true */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Loader2 className="w-16 h-16 animate-spin text-red-600 mb-4" />
              <p className="text-gray-600 text-lg">Loading story details...</p>
            </div>
          ) : (
            <>
              {/* Header Image */}
              <div className="relative h-80">
                <img
                  src={story.media.images[0]}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="w-5 h-5 text-red-400" />
                    <span className="text-sm text-white/80">
                      {story.donor.bloodGroup} • {story.donor.location}
                    </span>
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {story.title}
                  </h2>
                  <p className="text-xl text-white/90">{story.subtitle}</p>
                </div>
              </div>

              {/* Rest of the content... */}
              <div className="p-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    {
                      label: "Blood Units",
                      value: story.stats.bloodUnits,
                      icon: Droplet,
                    },
                    {
                      label: "Lives Impacted",
                      value: story.stats.livesImpacted,
                      icon: Users,
                    },
                    {
                      label: "Date",
                      value: formatDate(story.stats.surgeryDate),
                      icon: Calendar,
                    },
                    {
                      label: "Recovery",
                      value: story.stats.recoveryTime,
                      icon: Clock,
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="text-center p-4 bg-gray-50 rounded-xl"
                    >
                      <stat.icon className="w-5 h-5 text-red-600 mx-auto mb-2" />
                      <div className="text-lg font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Donor & Recipient Info */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-red-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      The Donor
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={story.donor.avatar}
                        alt={story.donor.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xl font-semibold text-gray-900">
                          {story.donor.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {story.donor.age} years • {story.donor.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          Donor since {story.donor.donorSince} •{" "}
                          {story.donor.totalDonations} donations
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 italic">"{story.donor.quote}"</p>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      The Recipient
                    </h3>
                    <div className="mb-4">
                      <p className="text-xl font-semibold text-gray-900">
                        {story.recipient.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {story.recipient.age} years • {story.recipient.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        {story.recipient.condition}
                      </p>
                    </div>
                    <p className="text-gray-700">{story.recipient.story}</p>
                  </div>
                </div>

                {/* Full Story */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    The Full Story
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {story.story}
                  </p>
                </div>

                {/* Impact */}
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Impact
                  </h3>
                  <p className="text-gray-700">{story.impact}</p>
                </div>

                {/* Hospital Info */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Hospital Details
                  </h3>
                  <p className="text-gray-700">{story.hospital.name}</p>
                  <p className="text-sm text-gray-600">{story.hospital.location}</p>
                  <p className="text-sm text-gray-600">
                    Attending Doctor: {story.hospital.doctor}
                  </p>
                </div>

                {/* Media Gallery */}
                {story.media.images && story.media.images.length > 1 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Gallery
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {story.media.images.slice(1).map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Share & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Share this story:</span>
                    <button
                      onClick={() => onShare("facebook", story)}
                      className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                      title="Share on Facebook"
                    >
                      <Facebook className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => onShare("twitter", story)}
                      className="p-2 hover:bg-sky-100 rounded-full transition-colors"
                      title="Share on Twitter"
                    >
                      <Twitter className="w-5 h-5 text-sky-500" />
                    </button>
                    <button
                      onClick={() => onShare("linkedin", story)}
                      className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="w-5 h-5 text-blue-700" />
                    </button>
                    <button
                      onClick={() => onShare("mail", story)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="Share via Email"
                    >
                      <Mail className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onShare("copy", story)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                      title="Copy Link"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDownload(story)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onShare("print", story)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                </div>

                {/* Engagement */}
                <div className="flex items-center gap-4 mt-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    <Heart className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium">{story.likes} Likes</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">
                      {story.comments} Comments
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
