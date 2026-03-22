const Comment = require("../models/Comment.model");
const Post = require("../models/Post.model");
const User = require("../models/User.model");
const ErrorHandler = require("../middlewares/error");
const catchAsyncError = require("../middlewares/catchAsyncError");

//* CREATE COMMENT
exports.createComment = catchAsyncError(async (req, res, next) => {
  const { content } = req.body;
  const { postId } = req.params;

  if (!content || content.trim().length === 0) {
    return next(new ErrorHandler("Comment content is required.", 400));
  }

  if (content.length < 2) {
    return next(new ErrorHandler("Comment must be at least 2 characters.", 400));
  }

  if (content.length > 1000) {
    return next(new ErrorHandler("Comment cannot exceed 1000 characters.", 400));
  }

  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  // Check if comments are allowed on this post
  if (!post.allowComments) {
    return next(new ErrorHandler("Comments are disabled for this post.", 403));
  }

  // Create comment
  const comment = await Comment.create({
    content: content.trim(),
    author: req.user.id,
    post: postId,
  });

  // Populate author details
  await comment.populate("author", "name avatar role");

  // Increment comment count
  post.stats.commentsCount += 1;
  await post.save({ validateModifiedOnly: true });

  res.status(201).json({
    success: true,
    message: "Comment created successfully.",
    data: comment,
  });
});

//* GET ALL COMMENTS ON A POST
exports.getCommentsByPost = catchAsyncError(async (req, res, next) => {
  const { postId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorHandler("Post not found.", 404));
  }

  // Get only top-level comments 
  const filter = { 
    post: postId, 
    parentComment: null, 
    isDeleted: false 
  };

  const total = await Comment.countDocuments(filter);

  const comments = await Comment.find(filter)
    .populate("author", "name avatar role")
    .populate({
      path: "replies",
      match: { isDeleted: false },
      populate: { path: "author", select: "name avatar role" },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
    data: comments,
  });
});

//* GET SINGLE COMMENT
exports.getSingleComment = catchAsyncError(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId)
    .populate("author", "name avatar role")
    .populate("likedBy", "name avatar")
    .populate({
      path: "replies",
      match: { isDeleted: false },
      populate: { path: "author", select: "name avatar role" },
    })
    .select("-__v");

  if (!comment || comment.isDeleted) {
    return next(new ErrorHandler("Comment not found.", 404));
  }

  res.status(200).json({
    success: true,
    data: comment,
  });
});

//* REPLY TO COMMENT
exports.replyToComment = catchAsyncError(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;

  // Validation
  if (!content || content.trim().length === 0) {
    return next(new ErrorHandler("Reply content is required.", 400));
  }

  if (content.length > 1000) {
    return next(new ErrorHandler("Reply cannot exceed 1000 characters.", 400));
  }

  // Find parent comment
  const parentComment = await Comment.findById(commentId);
  if (!parentComment || parentComment.isDeleted) {
    return next(new ErrorHandler("Parent comment not found.", 404));
  }

  // Create reply
  const reply = await Comment.create({
    content: content.trim(),
    author: req.user.id,
    post: parentComment.post,
    parentComment: commentId,
  });

  // Add reply to parent comment
  parentComment.replies.push(reply._id);
  await parentComment.save({ validateModifiedOnly: true });

  // Populate reply author
  await reply.populate("author", "name avatar role");

  res.status(201).json({
    success: true,
    message: "Reply created successfully.",
    data: reply,
  });
});

//* GET COMMENT REPLIES
exports.getCommentReplies = catchAsyncError(async (req, res, next) => {
  const { commentId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  // Check if parent comment exists
  const parentComment = await Comment.findById(commentId);
  if (!parentComment || parentComment.isDeleted) {
    return next(new ErrorHandler("Comment not found.", 404));
  }

  const total = await Comment.countDocuments({ 
    parentComment: commentId,
    isDeleted: false 
  });

  const replies = await Comment.find({ 
    parentComment: commentId,
    isDeleted: false 
  })
    .populate("author", "name avatar role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: replies,
  });
});

//* UPDATE COMMENT
exports.updateComment = catchAsyncError(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;

  // Validation
  if (!content || content.trim().length === 0) {
    return next(new ErrorHandler("Comment content is required.", 400));
  }

  if (content.length > 1000) {
    return next(new ErrorHandler("Comment cannot exceed 1000 characters.", 400));
  }

  // Find comment
  const comment = await Comment.findById(commentId);
  if (!comment || comment.isDeleted) {
    return next(new ErrorHandler("Comment not found.", 404));
  }

  // Check authorization - only author can edit
  if (comment.author.toString() !== req.user.id) {
    return next(new ErrorHandler("You are not authorized to update this comment.", 403));
  }

  // Update comment
  comment.content = content.trim();
  comment.isEdited = true;
  comment.editedAt = new Date();

  await comment.save({ validateModifiedOnly: true });

  // Populate author for response
  await comment.populate("author", "name avatar role");

  res.status(200).json({
    success: true,
    message: "Comment updated successfully.",
    data: comment,
  });
});

//* DELETE COMMENT - User can only delete own comments (soft delete)
exports.deleteComment = catchAsyncError(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment || comment.isDeleted) {
    return next(new ErrorHandler("Comment not found.", 404));
  }

  // Check authorization - only author can delete own comment
  if (comment.author.toString() !== req.user.id) {
    return next(new ErrorHandler("You are not authorized to delete this comment.", 403));
  }

  // Soft delete
  comment.isDeleted = true;
  comment.content = "[deleted]";
  comment.deletedAt = new Date();
  comment.deletedBy = req.user.id;
  await comment.save({ validateModifiedOnly: true });

  // Decrement post comment count
  const post = await Post.findById(comment.post);
  if (post) {
    post.stats.commentsCount = Math.max(0, post.stats.commentsCount - 1);
    await post.save({ validateModifiedOnly: true });
  }

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully.",
  });
});

//* LIKE/UNLIKE COMMENT
exports.toggleLikeComment = catchAsyncError(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment || comment.isDeleted) {
    return next(new ErrorHandler("Comment not found.", 404));
  }

  const userId = req.user.id;
  const isLiked = comment.likedBy.includes(userId);

  if (isLiked) {
    // Unlike
    comment.likedBy.pull(userId);
    comment.likes = Math.max(0, comment.likes - 1);
  } else {
    // Like
    comment.likedBy.push(userId);
    comment.likes += 1;
  }

  await comment.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: isLiked ? "Comment unliked successfully." : "Comment liked successfully.",
    isLiked: !isLiked,
    likes: comment.likes,
  });
});

//* GET ALL COMMENTS (Admin only) - For moderation
exports.getAllComments = catchAsyncError(async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Only admin can view all comments.", 403));
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { postId, isDeleted } = req.query;

  let filter = {};
  if (postId) filter.post = postId;
  if (isDeleted === "true") filter.isDeleted = true;
  else if (isDeleted === "false") filter.isDeleted = false;

  const total = await Comment.countDocuments(filter);

  const comments = await Comment.find(filter)
    .populate("author", "name avatar email")
    .populate("post", "title slug")
    .populate("deletedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
    data: comments,
  });
});

//* FORCE DELETE COMMENT (Admin only) - Permanent deletion
exports.forceDeleteComment = catchAsyncError(async (req, res, next) => {
  const { commentId } = req.params;
  const { reason } = req.body;

  // Check if user is admin
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Only admin can force delete comments.", 403));
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new ErrorHandler("Comment not found.", 404));
  }

  // Store deletion info before deleting
  const postId = comment.post;

  // Permanently delete comment
  await Comment.findByIdAndDelete(commentId);

  // Decrement post comment count
  const post = await Post.findById(postId);
  if (post) {
    post.stats.commentsCount = Math.max(0, post.stats.commentsCount - 1);
    await post.save({ validateModifiedOnly: true });
  }

  res.status(200).json({
    success: true,
    message: "Comment permanently deleted by admin.",
    data: {
      deletedCommentId: commentId,
      reason: reason || "No reason provided",
      deletedBy: req.user.id,
      deletedAt: new Date(),
    },
  });
});