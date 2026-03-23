const express = require("express");
const { isAuthenticated, isAuthorized } = require("../middlewares/auth");

const {
  createComment,
  getCommentsByPost,
  getSingleComment,
  replyToComment,
  getCommentReplies,
  updateComment,
  deleteComment,
  toggleLikeComment,
  getAllComments,
  forceDeleteComment,
} = require("../controllers/comment.controller");
const { validatePostId, validatePagination, validateCommentId , validateComment} = require("../middlewares/comment.validation");

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

router.get("/post/:postId", validatePostId, validatePagination, getCommentsByPost);
router.get("/:commentId", validateCommentId, getSingleComment);
router.get("/:commentId/replies", validateCommentId, validatePagination,  getCommentReplies);

// ==================== PROTECTED ROUTES (User) ====================

router.post("/post/:postId/create", isAuthenticated, validatePostId,validateComment, createComment); // Create comment on post
router.post("/:commentId/reply", isAuthenticated, validateCommentId, validateComment, replyToComment);
router.put("/:commentId", isAuthenticated, validateCommentId, validateComment, updateComment);
router.delete("/:commentId", isAuthenticated, validateCommentId, validateComment, deleteComment);

// Like/Unlike comment
router.post("/:commentId/like", isAuthenticated, toggleLikeComment);

// ==================== ADMIN ONLY ROUTES ====================

// Get all comments for moderation (Admin)
router.get("/admin/get-all/comments", isAuthenticated, isAuthorized("admin"), getAllComments);

// Force delete comment - Permanent deletion (Admin only)
router.delete("/admin/delete/:commentId/force", isAuthenticated, isAuthorized("admin"), forceDeleteComment);

module.exports = router;