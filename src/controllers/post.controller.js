const Post = require("../models/Post.model");
const User = require("../models/User.model");
const ErrorHandler = require("../middlewares/error");
const catchAsyncError = require("../middlewares/catchAsyncError");
const slugify = require("slugify");

// HELPER FUNCTION 
const calculateReadingTime = (content) => {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / 200);
};

//* CREATE POST 
exports.createPost = catchAsyncError(async (req, res, next) => {
  const {
    title,
    content,
    description,
    tags,
    category,
    featuredImage,
    seoTitle,
    seoDescription,
    seoKeywords,
    status,
  } = req.body;

  if (!title || !content) {
    return next(new ErrorHandler("Title and content are required.", 400));
  }

  if (title.length < 5) {
    return next(new ErrorHandler("Title must be at least 5 characters.", 400));
  }

  if (content.length < 50) {
    return next(new ErrorHandler("Content must be at least 50 characters.", 400));
  }

  // Generate slug
  let slug = slugify(title, { lower: true, strict: true });

  // Handle duplicate slug
  const existingPost = await Post.findOne({ slug });
  if (existingPost) {
    slug = `${slug}-${Date.now()}`;
  }

  let postStatus = "draft";
  if (status && ["draft", "published", "archived"].includes(status.toLowerCase())) {
    postStatus = status.toLowerCase();
  }

  const readingTime = calculateReadingTime(content);

  const postData = {
    title,
    content,
    description: description || title.substring(0, 100),
    tags: tags ? tags.map((tag) => tag.toLowerCase()) : [],
    category: category || "Other",
    slug,
    author: req.user.id,
    featuredImage: featuredImage || null,
    status: postStatus,
    seoTitle: seoTitle || title.substring(0, 60),
    seoDescription:
      seoDescription || description?.substring(0, 160) || "",
    seoKeywords: seoKeywords || [],
    stats: {
      views: 0,
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      readingTime: readingTime,
    },
  };

  if (postStatus === "published") {
    postData.publishedAt = new Date();
  }

  const post = await Post.create(postData);

  // Increment user's total posts
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { totalPosts: 1 },
  });

  res.status(201).json({
    success: true,
    message: "Post created successfully.",
    data: post,
  });
});

//* GET ALL POSTS 
exports.getAllPosts = catchAsyncError(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { tag, search, author, category, sort, isFeatured } = req.query;

  let filter = { status: "published" };

  if (tag) filter.tags = tag;
  if (author) filter.author = author;
  if (category) filter.category = category;
  if (isFeatured === "true") filter.isFeatured = true;

  if (search) {
    filter.$text = { $search: search };
  }

  let sortOption = { publishedAt: -1 };

  if (sort === "popular") {
    sortOption = { "stats.views": -1 };
  } else if (sort === "trending") {
    sortOption = { "stats.likes": -1 };
  } else if (sort === "oldest") {
    sortOption = { publishedAt: 1 };
  }

  const total = await Post.countDocuments(filter);
  const posts = await Post.find(filter)
    .populate("author", "name avatar bio role")
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .select("-__v -viewsHistory -likedBy -savedBy")
    .lean();

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
    data: posts,
  });
});

//* GET SINGLE POST - OPTIMIZED FOR SPEED WITH VIEW TRACKING 
exports.getSinglePost = catchAsyncError(async (req, res, next) => {
  const { slug } = req.params;

  const post = await Post.findOne({ slug, status: "published" })
    .populate("author", "name avatar bio role socialLinks followers")
    .populate("likedBy", "name avatar")
    .select("-__v");

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  post.stats.views = (post.stats.views || 0) + 1;

  if (req.user) {
    post.viewsHistory.push({
      userId: req.user.id,
      viewedAt: new Date(),
    });
  }

  await post.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: "Post fetched successfully",
    data: post,
    views: post.stats.views,
  });
});

//* GET TOP POSTS
exports.getTopPosts = catchAsyncError(async (req, res, next) => {
  const limit = Number(req.query.limit) || 5;
  const timeframe = req.query.timeframe || "month";

  let dateFilter = {};
  const now = new Date();

  if (timeframe === "week") {
    dateFilter = { publishedAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
  } else if (timeframe === "month") {
    dateFilter = { publishedAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
  }

  const posts = await Post.find({ status: "published", ...dateFilter })
    .sort({ "stats.views": -1 })
    .limit(limit)
    .populate("author", "name avatar")
    .select("title slug stats.views author createdAt")
    .lean();

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});

//* GET MY POSTS 
exports.getMyPosts = catchAsyncError(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { sort, status } = req.query;

  let sortOption = { createdAt: -1 };
  let filter = { author: req.user.id };

  if (status && ["draft", "published", "archived"].includes(status)) {
    filter.status = status;
  }

  if (sort === "views") {
    sortOption = { "stats.views": -1 };
  } else if (sort === "likes") {
    sortOption = { "stats.likes": -1 };
  }

  const total = await Post.countDocuments(filter);

  const posts = await Post.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .select("-__v -viewsHistory -likedBy -savedBy")
    .lean();

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
    data: posts,
  });
});

//* GET MY SAVED POSTS
exports.getMySavedPosts = catchAsyncError(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { sort } = req.query;

  let sortOption = { createdAt: -1 };

  if (sort === "views") {
    sortOption = { "stats.views": -1 };
  } else if (sort === "likes") {
    sortOption = { "stats.likes": -1 };
  } else if (sort === "newest") {
    sortOption = { publishedAt: -1 };
  }

  const total = await Post.countDocuments({ 
    savedBy: req.user.id,
    status: "published"
  });

  const posts = await Post.find({ 
    savedBy: req.user.id,
    status: "published"
  })
    .populate("author", "name avatar bio")
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .select("-__v -viewsHistory -likedBy -savedBy")
    .lean();

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
    data: posts,
  });
});

//* GET POSTS BY CATEGORY
exports.getPostsByCategory = catchAsyncError(async (req, res, next) => {
  const { category } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const validCategories = [
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
  ];

  if (!validCategories.includes(category)) {
    return next(new ErrorHandler(`Invalid category: ${category}`, 400));
  }

  const total = await Post.countDocuments({ category, status: "published" });

  const posts = await Post.find({ category, status: "published" })
    .populate("author", "name avatar")
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v -viewsHistory -likedBy -savedBy")
    .lean();

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    category,
    data: posts,
  });
});

//* GET POSTS BY AUTHOR 
exports.getPostsByAuthor = catchAsyncError(async (req, res, next) => {
  const { authorId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const author = await User.findById(authorId).lean();
  if (!author) {
    return next(new ErrorHandler("Author not found.", 404));
  }

  const total = await Post.countDocuments({ author: authorId, status: "published" });

  const posts = await Post.find({ author: authorId, status: "published" })
    .populate("author", "name avatar bio")
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v -viewsHistory -likedBy -savedBy")
    .lean();

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    author: author,
    data: posts,
  });
});

//* GET POSTS BY TAG 
exports.getPostsByTag = catchAsyncError(async (req, res, next) => {
  const { tag } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Post.countDocuments({ tags: tag, status: "published" });

  const posts = await Post.find({ tags: tag, status: "published" })
    .populate("author", "name avatar")
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v -viewsHistory -likedBy -savedBy")
    .lean();

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    tag,
    data: posts,
  });
});

//* UPDATE POST 
exports.updatePost = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, content, description, tags, category, status, featuredImage, seoTitle, seoDescription } = req.body;

  const post = await Post.findById(id);

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  // Authorization check
  if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorHandler("You are not authorized to update this post.", 403));
  }

  // Update allowed fields
  if (title) {
    if (title.length < 5) {
      return next(new ErrorHandler("Title must be at least 5 characters.", 400));
    }
    post.title = title;
    post.slug = slugify(title, { lower: true, strict: true });
  }

  if (content) {
    if (content.length < 50) {
      return next(new ErrorHandler("Content must be at least 50 characters.", 400));
    }
    post.content = content;
  }

  if (description) post.description = description;
  if (tags) post.tags = tags;
  if (category) post.category = category;
  if (status && ["draft", "published", "archived"].includes(status)) {
    post.status = status;
    if (status === "published" && !post.publishedAt) {
      post.publishedAt = new Date();
    }
  }
  if (featuredImage) post.featuredImage = featuredImage;
  if (seoTitle) post.seoTitle = seoTitle;
  if (seoDescription) post.seoDescription = seoDescription;

  await post.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: "Post updated successfully.",
    data: post,
  });
});

//* DELETE POST 
exports.deletePost = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  // Authorization check
  if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorHandler("You are not authorized to delete this post.", 403));
  }

  await Post.findByIdAndDelete(id);

  // Decrement user's total posts
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { totalPosts: -1 },
  });

  res.status(200).json({
    success: true,
    message: "Post deleted successfully.",
  });
});

//* LIKE/UNLIKE POST 
exports.toggleLikePost = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  const userId = req.user.id;
  const isLiked = post.likedBy.includes(userId);

  if (isLiked) {
    // Unlike
    post.likedBy.pull(userId);
    post.stats.likes = Math.max(0, post.stats.likes - 1);
  } else {
    // Like
    post.likedBy.push(userId);
    post.stats.likes += 1;
  }

  await post.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: isLiked ? "Post unliked successfully." : "Post liked successfully.",
    isLiked: !isLiked,
    likes: post.stats.likes,
  });
});

//* SAVE/UNSAVE POST 
exports.toggleSavePost = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  const userId = req.user.id;
  const isSaved = post.savedBy.includes(userId);

  if (isSaved) {
    post.savedBy.pull(userId);
  } else {
    post.savedBy.push(userId);
  }

  await post.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: isSaved ? "Post removed from saved." : "Post saved successfully.",
    isSaved: !isSaved,
    savedCount: post.savedBy.length,
  });
});

//* GET FEATURED POSTS 
exports.getFeaturedPosts = catchAsyncError(async (req, res, next) => {
  const limit = Number(req.query.limit) || 10;

  const posts = await Post.find({ status: "published", isFeatured: true })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate("author", "name avatar")
    .select("-__v -viewsHistory -likedBy -savedBy")
    .lean();

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});

//* SEARCH POSTS
exports.searchPosts = catchAsyncError(async (req, res, next) => {
  const { q } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!q || q.length < 2) {
    return next(new ErrorHandler("Search query must be at least 2 characters.", 400));
  }

  const total = await Post.countDocuments({
    $text: { $search: q },
    status: "published",
  });

  const posts = await Post.find(
    { $text: { $search: q }, status: "published" },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .populate("author", "name avatar")
    .skip(skip)
    .limit(limit)
    .select("-__v -viewsHistory -likedBy -savedBy")
    .lean();

  res.status(200).json({
    success: true,
    query: q,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: posts,
  });
});

//* PUBLISH SCHEDULED POSTS 
exports.publishScheduledPosts = catchAsyncError(async (req, res, next) => {
  const posts = await Post.find({
    status: "draft",
    scheduledFor: { $lte: new Date() },
  });

  let publishedCount = 0;

  for (let post of posts) {
    post.status = "published";
    post.publishedAt = new Date();
    await post.save({ validateModifiedOnly: true });
    publishedCount++;
  }

  res.status(200).json({
    success: true,
    message: `${publishedCount} posts published.`,
    publishedCount,
  });
});