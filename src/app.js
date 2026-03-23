const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const morgan = require("morgan");

const ErrorHandler = require("./middlewares/error");
const { errorMiddleware } = require("./middlewares/error");
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const { getCorsOptions } = require("./config/cors");

const app = express();

// MIDDLEWARES
app.use(helmet());
app.use(cors(getCorsOptions()));


// RATE LIMITERS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 12 * 60 * 60 * 1000,
  max: parseInt(process.env.MAX_OTP_ATTEMPTS || "5"),
  message: "Too many OTP verification attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip,
  skip: (req) => req.method !== "POST" || !req.path.includes("verify-otp"),
});

// BODY PARSING AND SECURITY
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
}


// routes
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

app.use("/api/v1/auth", authLimiter, otpLimiter, csrfProtection, authRoutes);
app.use("/api/v1/posts", csrfProtection, postRoutes);
app.use("/api/v1/comments", csrfProtection, commentRoutes);

app.use((req, res, next) => {
  next(new ErrorHandler(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorMiddleware);

module.exports = app;