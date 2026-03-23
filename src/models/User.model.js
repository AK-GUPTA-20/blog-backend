const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [32, "Password cannot exceed 32 characters"],
      select: false,
    },

    avatar: {
      type: String,
      default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    },

    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
      index: true,
    },

    bio: {
      type: String,
      default: "",
      maxLength: [500, "Bio cannot exceed 500 characters"],
    },

    socialLinks: {
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    verificationCode: {
      type: String,
      select: false,
    },

    verificationCodeExpire: {
      type: Date,
      select: false,
    },

    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    otpAttemptsResetTime: {
      type: Date,
      select: false,
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpire: {
      type: Date,
      select: false,
    },

    totalPosts: {
      type: Number,
      default: 0,
      index: true,
    },

    totalFollowers: {
      type: Number,
      default: 0,
    },

    totalFollowing: {
      type: Number,
      default: 0,
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    lastLoginAt: {
      type: Date,
      default: null,
    },

    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      privateProfile: {
        type: Boolean,
        default: false,
      },
      allowComments: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ email: 1, isVerified: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ totalPosts: -1 });

userSchema.virtual("isNewUser").get(function () {
  const daysSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return daysSinceCreation < 7;
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

userSchema.methods.generateVerificationCode = function () {
  const otpLength = parseInt(process.env.OTP_LENGTH || "6");
  const otpValidityHours = parseInt(process.env.OTP_VALIDITY_HOURS || "12");
  
  const verificationCode = Math.floor(
    Math.pow(10, otpLength - 1) + Math.random() * (Math.pow(10, otpLength) - Math.pow(10, otpLength - 1))
  ).toString();

  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + otpValidityHours * 60 * 60 * 1000;
  this.otpAttempts = 0;
  this.otpAttemptsResetTime = Date.now() + otpValidityHours * 60 * 60 * 1000;
  
  return verificationCode;
};

userSchema.methods.incrementOtpAttempts = function () {
  const maxAttempts = parseInt(process.env.MAX_OTP_ATTEMPTS || "5");
  const otpValidityHours = parseInt(process.env.OTP_VALIDITY_HOURS || "12");

  if (!this.otpAttemptsResetTime || Date.now() > this.otpAttemptsResetTime) {
    this.otpAttempts = 1;
    this.otpAttemptsResetTime = Date.now() + otpValidityHours * 60 * 60 * 1000;
  } else {
    this.otpAttempts += 1;
  }

  return this.otpAttempts >= maxAttempts;
};

userSchema.methods.isOtpAttemptLimitExceeded = function () {
  const maxAttempts = parseInt(process.env.MAX_OTP_ATTEMPTS || "5");
  
  if (!this.otpAttemptsResetTime || Date.now() > this.otpAttemptsResetTime) {
    return false;
  }

  return this.otpAttempts >= maxAttempts;
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verificationCode;
  delete user.verificationCodeExpire;
  delete user.otpAttempts;
  delete user.otpAttemptsResetTime;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  delete user.__v;
  return user;
};

module.exports = mongoose.model("User", userSchema);