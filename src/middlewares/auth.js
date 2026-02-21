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

module.exports = {
  isAuthenticated,
  isAdmin,
};
