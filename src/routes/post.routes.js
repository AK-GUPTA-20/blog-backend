const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");

const {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  topPosts,
  getMyPosts,
  likePost,
  getPostsByTag,
  getPostsByAuthor,
} = require("../controllers/post.controller");

const router = express.Router();


router.post("/create", isAuthenticated, createPost);

router.get("/", getAllPosts);
router.get("/top", topPosts);
router.get("/me", isAuthenticated, getMyPosts);
router.get("/tag/:tag", getPostsByTag);

router.get("/author/:authorId", getPostsByAuthor);
router.get("/:slug", getSinglePost);

router.put("/:id", isAuthenticated, updatePost);
router.delete("/:id", isAuthenticated, deletePost);
router.post("/:id/like", isAuthenticated, likePost);

module.exports = router;