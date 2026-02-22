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
router.get("/search/:slug", getSinglePost);

router.put("/update/:id", isAuthenticated, updatePost);
router.delete("/delete/:id", isAuthenticated, deletePost);
router.post("/like/:id", isAuthenticated, likePost);

module.exports = router;