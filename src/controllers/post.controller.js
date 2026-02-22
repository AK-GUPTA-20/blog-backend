const Post = require("../models/Post.model");
const ErrorHandler = require("../middlewares/error");
const catchAsyncError = require("../middlewares/catchAsyncError");
const slugify = require("slugify");
const User = require("../models/User.model");

//*  create a new post
exports.createPost = catchAsyncError(async (req, res, next) => {
  const { title, content, tags } = req.body;

  if (!title || !content) {
    return next(new ErrorHandler("Title and content are required.", 400));
  }

  // Generate slug
  let slug = slugify(title, { lower: true, strict: true });

  // Handle duplicate slug
  const existingPost = await Post.findOne({ slug });
  if (existingPost) {
    slug = `${slug}-${Date.now()}`;
  }

  const post = await Post.create({
    title,
    content,
    tags,
    slug,
    author: req.user.id,
    publishedAt: new Date(),
  });

  // Update user's totalPosts count
  await User.findByIdAndUpdate(
    req.user.id,
    { $inc: { totalPosts: 1 } },
    { new: true }
  );

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: post,
  });
});


//* GET ALL POSTS
exports.getAllPosts = catchAsyncError(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { tag, search, author, sort } = req.query;

  let filter = {};

  if (tag) filter.tags = tag;
  if (author) filter.author = author;

  if (search) {
    filter.$text = { $search: search };
  }

  let sortOption = { createdAt: -1 };

  if (sort === "popular") {
    sortOption = { "stats.likes": -1 };
  } else if (sort === "views") {
    sortOption = { "stats.views": -1 };
  }

  const total = await Post.countDocuments(filter);

  const posts = await Post.find(filter)
    .populate("author", "name avatar")
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: posts,
  });
});



//* get single post by slug

exports.getSinglePost = catchAsyncError(async (req, res, next) => {
  const { slug } = req.params;

  const post = await Post.findOne({ slug }).populate(
    "author",
    "name avatar bio",
  );

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  // Increment views
  post.stats.views += 1;
  await post.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    data: post,
  });
});


//* get top post
exports.topPosts = catchAsyncError(async (req, res, next) => {
  const limit = Number(req.query.limit) || 5;

  const posts = await Post.find()
    .sort({ "stats.views": -1 })
    .limit(limit)
    .populate("author", "name avatar")
    .select("title slug stats.views author createdAt");
    res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});


//* get my posts
exports.getMyPosts = catchAsyncError(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const { sort } = req.query;

  let sortOption = { createdAt: -1 }; // default latest first

  if (sort === "date_asc") {
    sortOption = { createdAt: 1 };
  } else if (sort === "date_desc") {
    sortOption = { createdAt: -1 };
  } else if (sort === "popular_asc") {
    sortOption = { "stats.views": 1 };
  } else if (sort === "popular_desc") {
    sortOption = { "stats.views": -1 };
  }

  const total = await Post.countDocuments({ author: req.user.id });

  const posts = await Post.find({ author: req.user.id })
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .select("-__v");

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: posts,
  });
});

//* get posts by specific author
exports.getPostsByAuthor = catchAsyncError(async (req, res, next) => {
  const { authorId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Post.countDocuments({ author: authorId });

  const posts = await Post.find({ author: authorId })
    .populate("author", "name avatar bio")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: posts,
  });
});

//* update post
exports.updatePost = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;

  const post = await Post.findById(id);

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  // Only author can update
  if (post.author.toString() !== req.user.id) {
    return next(
      new ErrorHandler("You are not authorized to update this post.", 403),
    );
  }

  if (title && title !== post.title) {
    let newSlug = slugify(title, { lower: true, strict: true });

    // Check if new slug already exists (excluding current post)
    const existingPost = await Post.findOne({
      slug: newSlug,
      _id: { $ne: post._id },
    });

    if (existingPost) {
      newSlug = `${newSlug}-${Date.now()}`;
    }

    post.title = title;
    post.slug = newSlug;
  }

  if (content) post.content = content;
  if (tags) post.tags = tags;

  await post.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: "Post updated successfully",
    data: post,
  });
});

//* delete post
exports.deletePost = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  // Only author can delete
  if (post.author.toString() !== req.user.id) {
    return next(
      new ErrorHandler("You are not authorized to delete this post.", 403),
    );
  }

  await post.deleteOne();

  // Decrease user's post count
  await User.findByIdAndUpdate(
    req.user.id,
    { $inc: { totalPosts: -1 } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});

//* like/unlike post
exports.likePost = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  // Toggle like (increment)
  post.stats.likes += 1;
  await post.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: "Post liked successfully",
    data: {
      likes: post.stats.likes,
    },
  });
});

//* get posts by tag
exports.getPostsByTag = catchAsyncError(async (req, res, next) => {
  const { tag } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Post.countDocuments({ tags: tag });

  const posts = await Post.find({ tags: tag })
    .populate("author", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: posts,
  });
});
