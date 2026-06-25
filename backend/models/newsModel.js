import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    readTime: { type: Number, default: 3 },
    image: { type: String, default: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format" },
    author: { type: String, required: true, trim: true },
    likes: { type: Number, default: 0 },
    comments: [
      {
        name: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    breaking: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("News", newsSchema);
