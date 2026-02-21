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
  forgotPassword,
  resetPassword,
  changePassword,
  deleteAccount,
} = require("../controllers/auth.controller");

const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

// ================= Public Routes =================
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/password/forgot", forgotPassword);
router.post("/password/reset/:token", resetPassword);
router.get("/user/:id", getUserById); // For viewing author profiles

// ================= Protected Routes =================
router.post(
  "/upload/profile-image",
  isAuthenticated,
  upload.single("image"),
  uploadProfileImage
);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.put("/update-profile", isAuthenticated, updateProfile);
router.put("/change-password", isAuthenticated, changePassword);
router.delete("/delete-account", isAuthenticated, deleteAccount);

module.exports = router;