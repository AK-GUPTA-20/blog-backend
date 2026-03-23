const jwt = require("jsonwebtoken");
const catchAsyncError = require("./catchAsyncError");
const ErrorHandler = require("./error");
const User = require("../models/User.model");


// Check if User is Authenticated
const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      new ErrorHandler("Please login to access this resource.", 401)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new ErrorHandler("User not found. Please login again.", 401)
      );
    }

    if (!user.isVerified) {
      return next(
        new ErrorHandler(
          "Account not verified. Please verify your account.",
          401
        )
      );
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    return next(
      new ErrorHandler(
        "Invalid or expired token. Please login again.",
        401
      )
    );
  }
});


// Check if User is Admin
const isAdmin = catchAsyncError(async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(
      new ErrorHandler(
        "Access denied. Admin privileges required.",
        403
      )
    );
  }

  next();
});


// Check if User has specific role (Admin, Moderator, etc.)
const isAuthorized = (roles) => {
  return catchAsyncError(async (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("Please login to access this resource.", 401));
    }

    // Convert single role to array for flexibility
    const rolesArray = Array.isArray(roles) ? roles : [roles];

    if (!rolesArray.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Access denied. This action requires ${rolesArray.join(" or ")} privileges.`,
          403
        )
      );
    }

    next();
  });
};


// Check if User is Moderator or Admin
const isModerator = catchAsyncError(async (req, res, next) => {
  if (!req.user || (req.user.role !== "moderator" && req.user.role !== "admin")) {
    return next(
      new ErrorHandler(
        "Access denied. Moderator or Admin privileges required.",
        403
      )
    );
  }

  next();
});

module.exports = {
  isAuthenticated,
  isAdmin,
  isAuthorized,
  isModerator,
};