const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    content: {
      type: String,
      required: [true, "Content is required"],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    category: {
      type: String,
      enum: [
        "Technology",
        "Lifestyle",
        "Travel",
        "Food",
        "Business",
        "Health",
        "Education",
        "Entertainment",
        "Sports",
        "Other",
      ],
      default: "Other",
      index: true,
    },

    featuredImage: {
      type: String,
      default: null,
    },

    images: [
      {
        url: String,
        alt: String,
      },
    ],

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },

    scheduledFor: {
      type: Date,
      default: null,
    },

    stats: {
      views: {
        type: Number,
        default: 0,
        index: true,
      },
      likes: {
        type: Number,
        default: 0,
        index: true,
      },
      commentsCount: {
        type: Number,
        default: 0,
      },
      sharesCount: {
        type: Number,
        default: 0,
      },
      readingTime: {
        type: Number,
        default: 0,
      },
    },

    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    seoTitle: {
      type: String,
      maxlength: [60, "SEO title cannot exceed 60 characters"],
      default: "",
    },

    seoDescription: {
      type: String,
      maxlength: [160, "SEO description cannot exceed 160 characters"],
      default: "",
    },

    seoKeywords: [String],

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    allowComments: {
      type: Boolean,
      default: true,
    },

    viewsHistory: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// ==================== INDEXES ====================
postSchema.index({ title: "text", content: "text", description: "text" });
postSchema.index({ createdAt: -1 });
postSchema.index({ publishedAt: -1 });
postSchema.index({ "stats.views": -1 });
postSchema.index({ "stats.likes": -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ author: 1, status: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ isFeatured: 1, publishedAt: -1 });

// ==================== VIRTUALS ====================
postSchema.virtual("commentCount").get(function () {
  return this.stats.commentsCount;
});

postSchema.virtual("isPublished").get(function () {
  return this.status === "published" && this.publishedAt <= new Date();
});

module.exports = mongoose.model("Post", postSchema);