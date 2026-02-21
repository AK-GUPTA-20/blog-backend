class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  // Invalid Mongo ID
  if (err.name === "CastError") {
    err = new ErrorHandler(`Resource not found. Invalid: ${err.path}`, 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = new ErrorHandler(`${field} already exists`, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("Invalid token. Please login again.", 401);
  }

  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("Token expired. Please login again.", 401);
  }

  // Validation errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = ErrorHandler;
module.exports.errorMiddleware = errorMiddleware;
