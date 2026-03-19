const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");

const {
  createPost,
  getAllPosts,
  getSinglePost,
  getTopPosts,
  getMyPosts,
  getPostsByCategory,
  getPostsByAuthor,
  getPostsByTag,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleSavePost,
  getFeaturedPosts,
  searchPosts,
  publishScheduledPosts,
} = require("../controllers/post.controller");

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

router.get("/", getAllPosts);
router.get("/top", getTopPosts);
router.get("/featured", getFeaturedPosts);
router.get("/search", searchPosts);
router.get("/article/:slug", getSinglePost);
router.get("/category/:category", getPostsByCategory);
router.get("/author/:authorId", getPostsByAuthor);
router.get("/tag/:tag", getPostsByTag);



// ==================== PROTECTED ROUTES ====================

router.post("/create", isAuthenticated, createPost);
router.get("/me/posts", isAuthenticated, getMyPosts);
router.put("/:id", isAuthenticated, updatePost);
router.delete("/:id", isAuthenticated, deletePost);
router.post("/:id/like", isAuthenticated, toggleLikePost);
router.post("/:id/save", isAuthenticated, toggleSavePost);
router.post("/admin/publish-scheduled", isAuthenticated, publishScheduledPosts); // Admin: Publish scheduled posts

module.exports = router;