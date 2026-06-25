import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    readTime: { type: Number, default: 5 },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    coverImage: { type: String, default: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format" },
    author: {
      name: { type: String, required: true },
      role: { type: String, required: true },
      avatar: { type: String },
    },
    tags: [{ type: String }],
    comments: [
      {
        name: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
