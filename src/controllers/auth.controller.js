const User = require("../models/User.model");
const ErrorHandler = require("../middlewares/error");
const catchAsyncError = require("../middlewares/catchAsyncError");
const sendToken = require("../utils/sendToken");
const sendEmail = require("../utils/sendEmail");
const generateEmailTemplate = require("../utils/generateEmailTemplate");
const { imagekit } = require("../config/ImageKit.upload");
const generateAvatar = require("../utils/generateAvatar");
const crypto = require("crypto");

//* HELPER FUNCTIONS

const sendVerificationCode = async (id, verificationCode, email, res) => {
  try {
    const html = generateEmailTemplate(verificationCode);
    await sendEmail({
      email,
      subject: "Your Email Verification Code",
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
      error: error.message,
    });
  }
};

//* ==================== AUTHENTICATION ROUTES ====================

//* REGISTRATION

const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password, avatar, bio, gender } = req.body;

  // Validation
  if (!name || !email || !password || !gender) {
    return next(new ErrorHandler("All fields are required.", 400));
  }

  // Normalize gender to lowercase
  const normalizedGender = String(gender).toLowerCase().trim();

  if (!['male', 'female'].includes(normalizedGender)) {
    return next(new ErrorHandler("Gender must be either male or female.", 400));
  }

  if (password.length < 8 || password.length > 32) {
    return next(
      new ErrorHandler("Password must be between 8 and 32 characters.", 400),
    );
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (!existingUser.isVerified) {
      await User.findByIdAndDelete(existingUser._id);
    } else {
      return next(new ErrorHandler("Email is already registered.", 409));
    }
  }

  // Create user with generated avatar based on gender
  const generatedAvatar = !avatar || avatar.trim() === "" 
    ? generateAvatar(normalizedGender) 
    : avatar;

  const user = await User.create({
    name,
    email,
    password,
    gender: normalizedGender,
    avatar: generatedAvatar,
    bio: bio || "",
  });

  const verificationCode = user.generateVerificationCode();
  await user.save({ validateModifiedOnly: true });

  await sendVerificationCode(user._id, verificationCode, email, res);
});

//* VERIFY OTP

const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Email and OTP are required.", 400));
  }

  // Select OTP tracking fields for security
  const user = await User.findOne({
    email,
    isVerified: false,
  }).select("+verificationCode +verificationCodeExpire +otpAttempts +otpAttemptsResetTime");

  if (!user) {
    return next(new ErrorHandler("No pending verification found.", 404));
  }

  if (Date.now() > user.verificationCodeExpire) {
    await User.findByIdAndDelete(user._id);
    return next(new ErrorHandler("OTP expired. Please register again.", 410));
  }

  // Check if OTP attempt limit exceeded
  if (user.isOtpAttemptLimitExceeded()) {
    return next(
      new ErrorHandler(
        "Too many OTP verification attempts. Please register again and try later.",
        429
      )
    );
  }

  if (String(user.verificationCode) !== String(otp)) {
    const isLimitExceeded = user.incrementOtpAttempts();
    await user.save({ validateModifiedOnly: true });

    if (isLimitExceeded) {
      return next(
        new ErrorHandler(
          "Invalid OTP. Maximum attempts exceeded. Please register again.",
          429
        )
      );
    }

    const maxAttempts = parseInt(process.env.MAX_OTP_ATTEMPTS || "5");
    const remainingAttempts = maxAttempts - user.otpAttempts;
    return next(
      new ErrorHandler(
        `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        400
      )
    );
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;
  user.otpAttempts = undefined;
  user.otpAttemptsResetTime = undefined;

  await user.save({ validateModifiedOnly: true });

  return sendToken(user, 200, "Account verified successfully.", res);
});

//* RESEND OTP

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

//* LOGIN

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
      new ErrorHandler("Account is deactivated. Please contact support.", 403),
    );
  }

  if (user.isBlocked) {
    return next(new ErrorHandler("Account has been blocked.", 403));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  user.lastLoginAt = new Date();
  await user.save({ validateModifiedOnly: true });

  return sendToken(user, 200, "Login successful.", res);
});

//* LOGOUT

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

//* UPLOAD PROFILE IMAGE

const uploadProfileImage = catchAsyncError(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler("Please upload an image.", 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  const result = await imagekit.upload({
    file: req.file.buffer,
    fileName: `profile_${user._id}_${Date.now()}`,
    folder: "/blog-backend/profile-images",
  });

  user.avatar = result.url;
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: "Profile image uploaded successfully.",
    avatar: result.url,
  });
});

//* GET CURRENT USER 

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

//* GET USER BY ID

const getUserById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId format
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ErrorHandler("Invalid user ID format.", 400));  
  }

  try {
    const user = await User.findById(id).select(
      "name avatar bio totalPosts totalFollowers totalFollowing createdAt role socialLinks isActive isBlocked"
    );

    if (!user) {
      return next(new ErrorHandler("User not found.", 404));
    }

    // Check if account is deactivated or blocked
    if (!user.isActive) {
      return next(new ErrorHandler("This user account has been deactivated.", 404));
    }

    if (user.isBlocked) {
      return next(new ErrorHandler("This user account has been blocked.", 404));
    }

    // Prepare response data
    const userData = {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      totalPosts: user.totalPosts,
      totalFollowers: user.totalFollowers,
      totalFollowing: user.totalFollowing,
      socialLinks: user.socialLinks,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return next(new ErrorHandler("Error fetching user profile", 500));
  }
});

//* UPDATE PROFILE

const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, bio, socialLinks, preferences } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  // Update allowed fields
  if (name) {
    if (name.length < 2 || name.length > 50) {
      return next(
        new ErrorHandler("Name must be between 2 and 50 characters.", 400),
      );
    }
    user.name = name;
  }

  if (bio !== undefined) {
    if (bio.length > 500) {
      return next(new ErrorHandler("Bio cannot exceed 500 characters.", 400));
    }
    user.bio = bio;
  }

  if (socialLinks) {
    user.socialLinks = {
      ...user.socialLinks,
      ...socialLinks,
    };
  }

  if (preferences) {
    user.preferences = {
      ...user.preferences,
      ...preferences,
    };
  }

  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user,
  });
});

//* CHANGE PASSWORD

const changePassword = catchAsyncError(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("All password fields are required.", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(
      new ErrorHandler("New password and confirm password do not match.", 400),
    );
  }

  if (newPassword.length < 8 || newPassword.length > 32) {
    return next(
      new ErrorHandler("Password must be between 8 and 32 characters.", 400),
    );
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  const isPasswordMatched = await user.comparePassword(currentPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Current password is incorrect.", 401));
  }

  user.password = newPassword;
  await user.save();

  return sendToken(user, 200, "Password changed successfully.", res);
});

//* FORGOT PASSWORD

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

  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

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
        500,
      ),
    );
  }
});

//* RESET PASSWORD 

const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(
      new ErrorHandler("Password and confirm password are required.", 400),
    );
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match.", 400));
  }

  if (password.length < 8 || password.length > 32) {
    return next(
      new ErrorHandler("Password must be between 8 and 32 characters.", 400),
    );
  }

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
      new ErrorHandler("Invalid or expired password reset token.", 400),
    );
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return sendToken(user, 200, "Password reset successfully.", res);
});

//* DELETE ACCOUNT 

const deleteAccount = catchAsyncError(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(
      new ErrorHandler("Password is required to delete account.", 400),
    );
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect password.", 401));
  }

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

//* FOLLOW/UNFOLLOW USER 

const toggleFollowUser = catchAsyncError(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  if (userId === currentUserId) {
    return next(new ErrorHandler("You cannot follow yourself.", 400));
  }

  const userToFollow = await User.findById(userId);
  const currentUser = await User.findById(currentUserId);

  if (!userToFollow || !currentUser) {
    return next(new ErrorHandler("User not found.", 404));
  }

  const isFollowing = currentUser.following.includes(userId);

  if (isFollowing) {
    // Unfollow
    currentUser.following.pull(userId);
    userToFollow.followers.pull(currentUserId);
    currentUser.totalFollowing = Math.max(0, currentUser.totalFollowing - 1);
    userToFollow.totalFollowers = Math.max(0, userToFollow.totalFollowers - 1);
  } else {
    // Follow
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);
    currentUser.totalFollowing += 1;
    userToFollow.totalFollowers += 1;
  }

  await currentUser.save({ validateModifiedOnly: true });
  await userToFollow.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: isFollowing
      ? "User unfollowed successfully."
      : "User followed successfully.",
    isFollowing: !isFollowing,
  });
});


//*  API GET ALL AUTHORS with full details (PUBLIC)

const getAllAuthors = catchAsyncError(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Get total count
  const total = await User.countDocuments({ 
    isActive: true, 
    isVerified: true,
    totalPosts: { $gt: 0 } // Only users who have posted
  });

  // Get authors sorted by total posts (most prolific first)
  const authors = await User.find({ 
    isActive: true, 
    isVerified: true,
    totalPosts: { $gt: 0 }
  })
    .select("name email avatar bio totalPosts totalFollowers createdAt")
    .sort({ totalPosts: -1, totalFollowers: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
    data: authors,
  });
});

//* GET TOP AUTHORS (PUBLIC)

const getTopAuthors = catchAsyncError(async (req, res, next) => {
  const limit =  5;

  const authors = await User.find({ 
    isActive: true, 
    isVerified: true,
    totalPosts: { $gt: 0 }
  })
    .select("name avatar totalPosts totalFollowers")
    .sort({ totalFollowers: -1, totalPosts: -1 })
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    count: authors.length,
    data: authors,
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
  toggleFollowUser,
  getAllAuthors,
  getTopAuthors,
};