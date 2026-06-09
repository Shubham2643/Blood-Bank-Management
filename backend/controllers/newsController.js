const MOCK_NEWS = [
  {
    id: 1,
    title:
      "Emergency Blood Appeal: Type O Negative Levels Drop Critically",
    summary:
      "Local hospitals report urgent need for Type O Negative blood donations.",
    content:
      "This is a mock emergency news item served by the backend.",
    category: "Emergency",
    readTime: 3,
    image:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format",
    author: "Dr. Sarah Johnson",
    likes: 234,
    comments: 45,
    breaking: true,
    featured: true,
    date: "March 15, 2026",
  },
  {
    id: 2,
    title: "New Study Reveals Blood Donation Reduces Heart Disease Risk",
    summary:
      "Regular blood donors show 30% lower risk of heart attacks, according to a study.",
    content: "This is a mock medical research news item served by the backend.",
    category: "Medical Research",
    readTime: 5,
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format",
    author: "Prof. Michael Chen",
    likes: 567,
    comments: 89,
    breaking: false,
    featured: false,
    date: "March 14, 2026",
  },
  {
    id: 3,
    title: "Annual Blood Donation Camp Breaks Records: 5000 Units Collected",
    summary: "Community comes together for record-breaking blood donation drive.",
    content: "This is a mock community camp news item served by the backend.",
    category: "Community",
    readTime: 4,
    image:
      "https://images.unsplash.com/photo-1581595219315-a187d40c3224?w=800&auto=format",
    author: "James Wilson",
    likes: 892,
    comments: 67,
    breaking: false,
    featured: true,
    date: "March 12, 2026",
  },
];

export const getAllNews = async (req, res) => {
  const { page = 1, category, search } = req.query;

  const p = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = 6;

  let filtered = [...MOCK_NEWS];
  if (category) filtered = filtered.filter((n) => n.category === category);
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q),
    );
  }

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const start = (p - 1) * pageSize;
  const end = start + pageSize;
  const news = filtered.slice(start, end);

  res.json({ news, totalPages });
};

export const getNewsById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const news = MOCK_NEWS.find((n) => String(n.id) === String(id));
    if (!news) return res.status(404).json({ message: "News not found" });
    res.json(news);
  } catch (error) {
    next(error);
  }
};

export const getNewsCategories = async (req, res) => {
  const categories = [...new Set(MOCK_NEWS.map((n) => n.category))];
  res.json({ categories });
};

export const getBreakingNews = async (req, res) => {
  res.json({ news: MOCK_NEWS.filter((n) => n.breaking) });
};

export const likeNews = async (req, res) => {
  // In a real app: store like in DB.
  res.json({ success: true });
};

export const saveNews = async (req, res) => {
  // In a real app: store saved article.
  res.json({ success: true });
};

