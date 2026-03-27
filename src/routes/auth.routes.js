const express = require("express");
const { upload } = require("../config/ImageKit.upload");
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  logout,
  uploadProfileImage,
  getUser,
  getUserById,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
  toggleFollowUser,
  getAllAuthors,
  getTopAuthors,
} = require("../controllers/auth.controller");
const { isAuthenticated, isAuthorized, isModerator } = require("../middlewares/auth");

const router = express.Router();

// ==================== PUBLIC ROUTES (AUTHENTICATION) ====================

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/:id", getUserById);

// ==================== PROTECTED ROUTES (AUTHENTICATION) ====================

router.post("/logout", isAuthenticated, logout);
router.get("/me/profile", isAuthenticated, getUser);
router.put("/me/update-profile", isAuthenticated, updateProfile);
router.post(
  "/me/upload-profile-image",
  isAuthenticated,
  upload.single("image"),
  uploadProfileImage
);

router.post("/me/change-password", isAuthenticated, changePassword);
router.post("/me/delete-account", isAuthenticated, deleteAccount);
router.post("/me/follow/:userId", isAuthenticated, toggleFollowUser); // Follow/unfollow user

// ==================== PUBLIC ROUTES (AUTHOR MANAGEMENT) ====================

router.get("/authors/list/all", getAllAuthors);

router.get("/authors/list/top", getTopAuthors);

module.exports = router;