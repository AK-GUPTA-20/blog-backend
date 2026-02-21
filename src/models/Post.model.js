const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    publishedAt: {
      type: Date,
    },

    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

// Text search index for search functionality
postSchema.index({ title: "text", content: "text" });

// Sorting indexes
postSchema.index({ createdAt: -1 });
postSchema.index({ publishedAt: -1 });

// Popular sorting indexes
postSchema.index({ "stats.views": -1 });
postSchema.index({ "stats.likes": -1 });

// My posts optimization 
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ author: 1, "stats.views": -1 });

// Tag filter index
postSchema.index({ tags: 1 });

module.exports = mongoose.model("Post", postSchema);