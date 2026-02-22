const User = require("../models/User.model");
const ErrorHandler = require("../middlewares/error");
const catchAsyncError = require("../middlewares/catchAsyncError");
const sendToken = require("../utils/sendToken");
const sendEmail = require("../utils/sendEmail");
const generateEmailTemplate = require("../utils/generateEmailTemplate");
const { imagekit } = require("../config/ImageKit.upload");
const crypto = require("crypto");

//* Function to send verification code
const sendVerificationCode = async (id, verificationCode, email, res) => {
  try {
    const html = generateEmailTemplate(verificationCode);
    await sendEmail({
      email,
      subject: "Your Verification Code",
      message:
        "Please use the verification code sent to your email to complete registration.",
      html,
    });

    return res.status(200).json({
      success: true,
      message: `Verification email successfully sent to ${email}`,
    });
  } catch (error) {
    await User.findByIdAndDelete(id);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code. Please try again.",
    });
  }
};

//* Register new user
/*
const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password, avatar, bio } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("All fields are required.", 400));
  }

  if (password.length < 8 || password.length > 32) {
    return next(
      new ErrorHandler("Password must be between 8 and 32 characters.", 400)
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (!existingUser.isVerified) {
      await User.findByIdAndDelete(existingUser._id);
    } else {
      return next(new ErrorHandler("Email is already registered.", 400));
    }
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    ...(avatar && { avatar }),
    ...(bio && { bio }),
  });

  const verificationCode = user.generateVerificationCode();
  await user.save({ validateModifiedOnly: true });

  await sendVerificationCode(user._id, verificationCode, email, res);
});

*/

//* Register new user (No Email Verification)
const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password, avatar, bio } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("All fields are required.", 400));
  }

  if (password.length < 8 || password.length > 32) {
    return next(
      new ErrorHandler("Password must be between 8 and 32 characters.", 400)
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new ErrorHandler("Email is already registered.", 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    avatar: avatar || "",
    bio: bio || "",
    isVerified: false,   
  });

  return sendToken(user, 201, "Registration successful.", res);
});

//* Verify OTP
const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Email and OTP are required.", 400));
  }

  const user = await User.findOne({
    email,
    isVerified: false,
  }).select("+verificationCode +verificationCodeExpire");

  if (!user) {
    return next(new ErrorHandler("No pending verification found.", 404));
  }

  if (Date.now() > user.verificationCodeExpire) {
    await User.findByIdAndDelete(user._id);
    return next(new ErrorHandler("OTP expired. Please register again.", 400));
  }

  if (user.verificationCode !== Number(otp)) {
    return next(new ErrorHandler("Invalid OTP.", 400));
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;

  await user.save({ validateModifiedOnly: true });

  return sendToken(user, 200, "Account verified successfully.", res);
});

//* Resend OTP
const resendOTP = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is required.", 400));
  }

  const user = await User.findOne({
    email,
    isVerified: false,
  });

  if (!user) {
    return next(new ErrorHandler("No pending verification found.", 404));
  }

  const verificationCode = user.generateVerificationCode();
  await user.save({ validateModifiedOnly: true });

  await sendVerificationCode(user._id, verificationCode, email, res);
});

//* Login
const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required.", 400));
  }

  const user = await User.findOne({
    email,
    isVerified: true,
  }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  if (!user.isActive) {
    return next(
      new ErrorHandler("Account is deactivated. Please contact support.", 403)
    );
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  return sendToken(user, 200, "Login successful.", res);
});

//* Logout
const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({
      success: true,
      message: "Logged out successfully.",
    });
});

//* Upload profile picture
const uploadProfileImage = catchAsyncError(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler("Please upload an image", 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Upload to ImageKit
  const result = await imagekit.upload({
    file: req.file.buffer,
    fileName: `profile_${user._id}_${Date.now()}`,
    folder: "/blog-backend/profile-images",
  });

  // Update user avatar
  user.avatar = result.url;
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: "Profile image uploaded successfully",
    avatar: result.url,
  });
});

//* Get current user profile
const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//* Update user profile
const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, bio } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  // Update fields
  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;

  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user,
  });
});

//* Change password (authenticated)
const changePassword = catchAsyncError(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("All password fields are required.", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(
      new ErrorHandler("New password and confirm password do not match.", 400)
    );
  }

  if (newPassword.length < 8 || newPassword.length > 32) {
    return next(
      new ErrorHandler("Password must be between 8 and 32 characters.", 400)
    );
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  // Verify current password
  const isPasswordMatched = await user.comparePassword(currentPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Current password is incorrect.", 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return sendToken(user, 200, "Password changed successfully.", res);
});

//* Forgot password
const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is required.", 400));
  }

  const user = await User.findOne({
    email,
    isVerified: true,
  });

  if (!user) {
    return next(new ErrorHandler("No user found with this email.", 404));
  }

  // Generate reset token
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `You requested a password reset. Please click the link below to reset your password:\n\n${resetPasswordUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Password reset email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new ErrorHandler(
        "Failed to send password reset email. Please try again.",
        500
      )
    );
  }
});

//* Reset password
const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(
      new ErrorHandler("Password and confirm password are required.", 400)
    );
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match.", 400));
  }

  if (password.length < 8 || password.length > 32) {
    return next(
      new ErrorHandler("Password must be between 8 and 32 characters.", 400)
    );
  }

  // Hash the token to compare with stored hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpire");

  if (!user) {
    return next(
      new ErrorHandler("Invalid or expired password reset token.", 400)
    );
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return sendToken(user, 200, "Password reset successfully.", res);
});

//* Delete account (authenticated)
const deleteAccount = catchAsyncError(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(
      new ErrorHandler("Password is required to delete account.", 400)
    );
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  // Verify password
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect password.", 401));
  }

  // Delete user
  await User.findByIdAndDelete(req.user.id);

  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({
      success: true,
      message: "Account deleted successfully.",
    });
});

//* Get user by ID (public - for author info)
const getUserById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id).select("name avatar bio totalPosts createdAt");

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  if (!user.isActive) {
    return next(new ErrorHandler("User account is inactive.", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

module.exports = {
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
};