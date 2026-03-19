const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const ErrorHandler = require("./middlewares/error");
const { errorMiddleware } = require("./middlewares/error");
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const { getCorsOptions } = require("./config/cors");

const app = express();

// ==================== SECURITY MIDDLEWARE ====================

// Helmet - Security headers
app.use(helmet());

// CORS configuration
app.use(cors(getCorsOptions()));


// ==================== RATE LIMITING ====================

// General rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== BODY PARSER ====================

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ==================== LOGGING ====================

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
}


app.use("/api/", limiter);


app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Blog Backend API is running 🚀",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API ROUTES 

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/posts", postRoutes);

// ERROR HANDLING 

// 404 - Route not found
app.use((req, res, next) => {
  next(new ErrorHandler(`Route ${req.originalUrl} not found`, 404));
});

// Global error middleware
app.use(errorMiddleware);

module.exports = app;