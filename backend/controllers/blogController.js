import Blog from "../models/blogModel.js";
import { AppError } from "../utils/errorHandler.js";

const DEFAULT_BLOGS = [
  {
    title: "The Life-Saving Power of Blood Donation: One Pint Can Save Three Lives",
    excerpt: "Discover how a single blood donation can have a ripple effect, saving up to three lives in emergencies.",
    content: `### Why Blood Donation Matters
Every day, thousands of patients rely on the generosity of blood donors to survive surgeries, cancer treatments, chronic illnesses, and traumatic injuries. Despite advancements in medical technology, human blood cannot be manufactured—it can only come from voluntary donors.

#### The Triple Impact
When you donate one unit (approximately one pint) of blood, it is separated into three key components:
1. **Red Blood Cells**: Crucial for trauma patients, surgeries, and treating severe anemia.
2. **Plasma**: Packed with proteins and clotting factors, essential for burn victims and liver disease treatments.
3. **Platelets**: Critical for cancer patients undergoing chemotherapy, helping their blood clot properly.

By donating just once, you are literally giving the gift of life to up to three individual patients.

#### How to Prepare for Your Donation
* **Hydrate**: Drink plenty of water (at least 16 oz) before your appointment.
* **Eat a Healthy Meal**: Focus on iron-rich foods like spinach, red meat, or beans. Avoid fatty foods.
* **Get Rest**: Ensure you get a solid 8 hours of sleep the night before.
* **Bring ID**: Don't forget your government-issued ID or donor card.

Join us in our next donation drive and be the hero someone is waiting for!`,
    category: "Blood Donation",
    readTime: 5,
    likes: 245,
    views: 1250,
    coverImage: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format",
    author: {
      name: "Dr. Sarah Johnson",
      role: "Hematologist",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
    },
    tags: ["blood", "donation", "lifesaver"],
    published: true,
    comments: [
      { name: "John Doe", text: "This is a great article. I donated last week and it was a smooth process!" },
      { name: "Emily Watson", text: "Very informative. I did not know one pint gets split into three components!" }
    ],
    createdAt: new Date("2026-06-14T09:00:00Z")
  },
  {
    title: "Understanding Blood Types: Why Your Rare Type Matters in Emergencies",
    excerpt: "A comprehensive guide to blood types, compatibility charts, and why rare types are in constant demand.",
    content: `### The Science of Blood Types
Your blood type is determined by antigens present on the surface of your red blood cells. The two major systems are the **ABO system** (A, B, AB, O) and the **Rh system** (Positive or Negative).

| Blood Type | Can Give To | Can Receive From |
| :--- | :--- | :--- |
| **O-** | Anyone (Universal Donor) | O- Only |
| **O+** | O+, A+, B+, AB+ | O+, O- |
| **A-** | A-, A+, AB-, AB+ | A-, O- |
| **A+** | A+, AB+ | A+, A-, O+, O- |
| **B-** | B-, B+, AB-, AB+ | B-, O- |
| **B+** | B+, AB+ | B+, B-, O+, O- |
| **AB-** | AB-, AB+ | AB-, A-, B-, O- |
| **AB+** | AB+ Only (Universal Recipient) | Anyone |

#### The Importance of O-Negative (O-)
O-negative blood is known as the **Universal Donor** type. In emergency rooms, when a trauma patient is bleeding out and doctors don't have time to test their blood type, they immediately reach for O-negative blood. 

Because only about 7% of the population has O-negative blood, it is constantly in critically short supply. If you are O-negative, your blood is a precious lifeline.

#### The Power of AB-Positive (AB+)
On the flip side, AB-positive individuals are **Universal Recipients**. They can safely receive blood from any type. However, they are also the universal donors of **plasma**, which is highly sought after for patients in critical condition.`,
    category: "Health & Wellness",
    readTime: 7,
    likes: 189,
    views: 940,
    coverImage: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format",
    author: {
      name: "Dr. Michael Chen",
      role: "Immunologist",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop",
    },
    tags: ["blood-types", "science", "compatibility"],
    published: true,
    comments: [
      { name: "Alice Green", text: "I'm O-negative! Proud to be a universal donor. Heading to a camp tomorrow." }
    ],
    createdAt: new Date("2026-06-08T10:30:00Z")
  },
  {
    title: "Nutrition Checklist for Blood Donors: What to Eat Before & After",
    excerpt: "Boost your iron levels and recover quickly with our expert-approved pre- and post-donation meal plan.",
    content: `### Nutrition prep checklist for blood donors
Eating the right foods before and after donating blood makes a massive difference in how you feel. It helps keep your energy high, prevents lightheadedness, and ensures your body replenishes red blood cells rapidly.

#### Pre-Donation: Focus on Iron & Hydration
Iron is an essential component of hemoglobin, which carries oxygen in your blood. When you donate, you lose iron, so it's critical to build up your stores beforehand.
* **Iron-Rich Foods**: Lean meats, fish, beans, spinach, and fortified cereals.
* **Vitamin C Boost**: Eat oranges, bell peppers, or strawberries alongside iron-rich foods to double your body's iron absorption.
* **Hydrate**: Drink plenty of water (at least 16-24 ounces) in the 24 hours leading up to your donation.

#### Post-Donation: Replenish and Recover
After donation, your immediate goal is to restore fluid volume and blood sugar levels.
* **Liquids First**: Drink plenty of water, juices, or herbal teas. Avoid alcohol for at least 24 hours.
* **Folate & B-Complex**: Eat leafy greens, eggs, and dairy to help your bone marrow produce new red blood cells.
* **Healthy Snacks**: Enjoy the snacks provided at the camp (pretzels, cookies, or fruit) to quickly stabilize blood sugar.`,
    category: "Health & Wellness",
    readTime: 4,
    likes: 124,
    views: 480,
    coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format",
    author: {
      name: "Dr. Sarah Johnson",
      role: "Hematologist",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
    },
    tags: ["nutrition", "diet", "recovery"],
    published: true,
    comments: [],
    createdAt: new Date("2026-05-18T09:00:00Z")
  },
  {
    title: "First-Time Donor's Guide: Step-by-Step of What to Expect",
    excerpt: "Demystifying the blood donation process so you can walk into your first appointment with confidence.",
    content: `### Demystifying the Blood Donation Process
It's normal to feel nervous before your first blood donation. However, knowing exactly what happens can turn anxiety into excitement. The entire process takes less than an hour, while the actual blood collection lasts only 8 to 10 minutes.

#### Step 1: Registration and Screening
When you arrive, you'll register and fill out a confidential questionnaire about your medical history, travel, and lifestyle. A healthcare professional will check your temperature, blood pressure, pulse, and take a tiny droplet of blood from your finger to verify your hemoglobin levels are safe for donation.

#### Step 2: The Donation
You'll recline in a comfortable chair. A phlebotomist will clean your arm and insert a sterile, brand-new needle. You'll feel a brief pinch, and then you'll just relax, read, or listen to music while the blood bag fills. This step takes about 8 to 10 minutes.

#### Step 3: Refreshments and Recovery
After donating, the needle is removed and a small bandage is applied. You'll head to the refreshment area to sit for 15 minutes, enjoy juice, water, and cookies, and let your body adjust. Once you feel fine, you're free to go and enjoy the rest of your day, knowing you've saved lives!`,
    category: "Blood Donation",
    readTime: 5,
    likes: 156,
    views: 620,
    coverImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format",
    author: {
      name: "Dr. Michael Chen",
      role: "Immunologist",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop",
    },
    tags: ["first-time", "guide", "donors"],
    published: true,
    comments: [],
    createdAt: new Date("2026-05-10T10:30:00Z")
  },
  {
    title: "How Technology is Revolutionizing Blood Banking & Safety",
    excerpt: "From cold chain monitoring to real-time donor matching apps, explore the tech saving lives in modern medicine.",
    content: `### High-Tech Transfusion Medicine
Blood banking has come a long way from the simple refrigerated storage of the mid-20th century. Today, advanced hardware and software technologies are ensuring that every pint of blood is tracked, screened, and matched with absolute precision.

#### Real-Time Inventory & Matching
Web platforms and mobile apps are now linking local hospitals directly with blood labs and donor registries. When an emergency patient needs O-negative blood, smart systems can instantly broadcast SMS or app push notifications to registered donors within a 10km radius. This drastically cuts down search times during critical emergencies.

#### Smart Cold Chain Management
Blood components are highly temperature-sensitive. Platelets must be stored at room temperature with continuous agitation, while red blood cells require strictly monitored refrigeration. Modern blood banks utilize IoT-enabled temperature sensors that send instant alerts to lab technicians if a storage unit deviates by even half a degree, preventing wastage.

#### Automated Screening & Pathogen Testing
High-throughput automated molecular testing systems are screening donated units for infectious diseases like hepatitis and HIV with higher accuracy than ever. These advancements ensure that the recipient receives the safest blood possible, minimizing transfusion reaction risks.`,
    category: "Medical Research",
    readTime: 6,
    likes: 110,
    views: 540,
    coverImage: "https://images.unsplash.com/photo-1581595219315-a187d40c3224?w=800&auto=format",
    author: {
      name: "Prof. Michael Chen",
      role: "Immunologist",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop",
    },
    tags: ["technology", "medical-tech", "safety"],
    published: true,
    comments: [],
    createdAt: new Date("2026-04-12T14:00:00Z")
  },
  {
    title: "Debunking Blood Donation Myths: Separating Fact from Fiction",
    excerpt: "Afraid of needles or think you are too old to donate? We address common donation misconceptions.",
    content: `### Myth vs. Fact
Many healthy adults are hesitant to donate blood due to misconceptions. Let's separate the facts from the fiction to help you feel confident about saving lives.

#### Myth 1: \"Giving blood hurts too much.\""
**FACT:** You will feel a brief pinch (similar to a quick sting) when the needle is inserted, but the actual donation process is virtually painless. Most donors describe it as a minor discomfort.

#### Myth 2: \"I could contract an infection or disease by donating.\""
**FACT:** The donation process is extremely safe. All needles and collection bags are sterile, single-use, and disposed of immediately after your donation. There is absolutely zero risk of contracting HIV or other infections from donating blood.

#### Myth 3: \"My body will run out of blood.\""
**FACT:** The average adult has about 10 to 12 pints of blood. A standard donation takes only 1 pint. Your body replenishes the lost fluids within 24 to 48 hours, and red blood cells are completely replaced within 4 to 6 weeks.

#### Myth 4: \"I'm on medication, so I can't donate.\""
**FACT:** Most medications (like high blood pressure pills, birth control, or antidepressants) do **not** disqualify you from donating. The medical staff at the camp will do a quick screening to verify compatibility.`,
    category: "Expert Advice",
    readTime: 6,
    likes: 312,
    views: 1420,
    coverImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format",
    author: {
      name: "Dr. Sarah Johnson",
      role: "Hematologist",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
    },
    tags: ["myths", "education", "tips"],
    published: true,
    comments: [],
    createdAt: new Date("2026-04-05T11:00:00Z")
  }
];

export const seedBlogsIfEmpty = async () => {
  try {
    const count = await Blog.countDocuments();
    if (count < 6) {
      await Blog.deleteMany({}); // Drop old seeds to allow fresh seed
      await Blog.insertMany(DEFAULT_BLOGS);
      console.log("✅ Seeded initial blogs database with April, May, June 2026 articles successfully");
    }
  } catch (error) {
    console.error("❌ Error seeding blogs database:", error);
  }
};

export const getAllBlogs = async (req, res, next) => {
  try {
    await seedBlogsIfEmpty();

    const { page = 1, category, search } = req.query;
    const p = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = 6;

    const query = { published: true };

    if (category && category !== "all" && category !== "null" && category !== "null") {
      query.category = category;
    }

    if (search) {
      const regex = new RegExp(String(search).trim(), "i");
      query.$or = [
        { title: regex },
        { excerpt: regex },
        { content: regex }
      ];
    }

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / pageSize) || 1;

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((p - 1) * pageSize)
      .limit(pageSize);

    // Calculate dynamic stats
    const totalViewsResult = await Blog.aggregate([
      { $group: { _id: null, count: { $sum: "$views" } } }
    ]);
    const totalLikesResult = await Blog.aggregate([
      { $group: { _id: null, count: { $sum: "$likes" } } }
    ]);
    const allBlogsList = await Blog.find({}, "comments");
    const totalComments = allBlogsList.reduce((sum, b) => sum + (b.comments?.length || 0), 0);

    const stats = {
      totalBlogs,
      totalViews: totalViewsResult[0]?.count || 3610,
      totalLikes: totalLikesResult[0]?.count || 746,
      totalComments: totalComments || 3
    };

    res.json({ blogs, totalPages, stats });
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      throw new AppError("Blog post not found", 404);
    }

    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    next(error);
  }
};

export const getBlogCategories = async (req, res, next) => {
  try {
    await seedBlogsIfEmpty();
    const categories = await Blog.distinct("category");
    res.json({ categories: categories.length ? categories : ["Blood Donation", "Health & Wellness", "Expert Advice", "Medical Research"] });
  } catch (error) {
    next(error);
  }
};

export const getPopularBlogs = async (req, res, next) => {
  try {
    await seedBlogsIfEmpty();
    const blogs = await Blog.find({ published: true })
      .sort({ views: -1 })
      .limit(3);
    res.json({ blogs });
  } catch (error) {
    next(error);
  }
};

export const likeBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      throw new AppError("Blog post not found", 404);
    }

    blog.likes += 1;
    await blog.save();

    // Broadcast updated likes in real-time
    const io = req.app.get("io");
    if (io) {
      io.emit("blog-updated", { id: blog._id, likes: blog.likes });
    }

    res.json({ success: true, likes: blog.likes });
  } catch (error) {
    next(error);
  }
};

export const commentOnBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const commentText = typeof req.body.comment === "string" ? req.body.comment : req.body.comment?.text || req.body.text;

    if (!commentText || commentText.trim() === "") {
      throw new AppError("Comment text is required", 400);
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      throw new AppError("Blog post not found", 404);
    }

    const commentAuthor = req.user?.username || req.user?.email || "Anonymous";

    const newComment = {
      name: commentAuthor,
      text: commentText.trim(),
      createdAt: new Date()
    };

    blog.comments.push(newComment);
    await blog.save();

    // Broadcast updated comments in real-time
    const io = req.app.get("io");
    if (io) {
      io.emit("blog-updated", { id: blog._id, comments: blog.comments });
    }

    res.json({ success: true, comments: blog.comments });
  } catch (error) {
    next(error);
  }
};

export const saveBlog = async (req, res, next) => {
  try {
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, category, readTime, coverImage, tags } = req.body;

    if (!title || !excerpt || !content || !category || !coverImage) {
      throw new AppError("Missing required blog fields", 400);
    }

    const authorName = req.user?.username || "Admin Team";
    const authorRole = req.user?.role === "admin" ? "Administrator" : req.user?.role || "Healthcare Professional";
    const authorAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop";

    const newBlog = await Blog.create({
      title,
      excerpt,
      content,
      category,
      readTime: Number(readTime) || 5,
      coverImage,
      tags: tags || [],
      author: {
        name: authorName,
        role: authorRole,
        avatar: authorAvatar
      },
      published: true
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("blog-feed-updated");
      io.emit("new-blog-post", newBlog);
    }

    res.status(201).json({ success: true, blog: newBlog });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const blog = await Blog.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!blog) {
      throw new AppError("Blog post not found", 404);
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("blog-feed-updated");
    }

    res.json({ success: true, blog });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      throw new AppError("Blog post not found", 404);
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("blog-feed-updated");
    }

    res.json({ success: true, message: "Blog post deleted successfully" });
  } catch (error) {
    next(error);
  }
};
