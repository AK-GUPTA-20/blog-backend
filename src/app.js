const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const ErrorHandler = require("./middlewares/error");
const { errorMiddleware } = require("./middlewares/error");
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");

const app = express();
app.set("trust proxy", 1);


// Helmet - Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Sanitize data against NoSQL injection
//app.use(mongoSanitize());

// General rate limiting for all API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

//  Body Parser 
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Apply general rate limiting to all API routes
app.use("/api/", limiter);

// Stricter rate limit for auth routes only
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});




// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Production logging
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
}



// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Blog Backend API is running 🚀",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

//  routes
app.use("/api/v1/user", authLimiter, authRoutes);
app.use("/api/v1/posts", postRoutes);



// 404 - Route not found
app.use((req, res, next) => {
  next(new ErrorHandler(`Route ${req.originalUrl} not found`, 404));
});

// Global error middleware
app.use(errorMiddleware);

module.exports = app;