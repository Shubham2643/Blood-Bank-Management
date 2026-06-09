const MOCK_BLOGS = [
  {
    id: "1",
    title:
      "The Life-Saving Power of Blood Donation: One Pint Can Save Three Lives",
    excerpt:
      "Discover how a single blood donation can have a ripple effect, saving up to three lives.",
    content: "Mock content for blog post served by the backend.",
    category: "Blood Donation",
    readTime: 5,
    likes: 234,
    comments: 45,
    views: 1234,
    date: "March 15, 2026",
    coverImage:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format",
    author: {
      name: "Dr. Sarah Johnson",
      role: "Hematologist",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    tags: ["blood", "donation"],
    published: true,
  },
  {
    id: "2",
    title: "Understanding Blood Types: Why Your Type Matters",
    excerpt: "A guide to blood types and why knowing yours can help in emergencies.",
    content: "Mock content for blog post served by the backend.",
    category: "Health & Wellness",
    readTime: 8,
    likes: 189,
    comments: 32,
    views: 987,
    date: "March 12, 2026",
    coverImage:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format",
    author: {
      name: "Dr. Michael Chen",
      role: "Immunologist",
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
    },
    tags: ["blood-types"],
    published: true,
  },
];

export const getAllBlogs = async (req, res) => {
  const { page = 1, category, search } = req.query;

  const p = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = 6;

  let filtered = [...MOCK_BLOGS];
  if (category) filtered = filtered.filter((b) => b.category === category);
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q),
    );
  }

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const start = (p - 1) * pageSize;
  const end = start + pageSize;
  const blogs = filtered.slice(start, end);

  res.json({ blogs, totalPages });
};

export const getBlogById = async (req, res) => {
  const id = req.params.id;
  const blog = MOCK_BLOGS.find((b) => String(b.id) === String(id));
  if (!blog) return res.status(404).json({ message: "Blog not found" });
  res.json(blog);
};

export const getBlogCategories = async (req, res) => {
  const categories = [...new Set(MOCK_BLOGS.map((b) => b.category))];
  res.json({ categories });
};

export const getPopularBlogs = async (req, res) => {
  const popular = [...MOCK_BLOGS].sort((a, b) => (b.views || 0) - (a.views || 0));
  res.json({ blogs: popular.slice(0, 3) });
};

export const likeBlog = async (req, res) => res.json({ success: true });
export const saveBlog = async (req, res) => res.json({ success: true });
export const commentOnBlog = async (req, res) => res.json({ success: true });

export const createBlog = async (req, res) => res.json({ success: true });
export const updateBlog = async (req, res) => res.json({ success: true });
export const deleteBlog = async (req, res) => res.json({ success: true });

