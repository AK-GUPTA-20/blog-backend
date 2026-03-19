#  Blog Backend API

A scalable and production-ready RESTful backend API for a blogging platform. This project provides comprehensive authentication, advanced post management, user management, interactions, image uploads, email utilities, and robust error handling using Node.js, Express, and MongoDB.

---

##  Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB + Mongoose
* **Authentication:** JWT (JSON Web Tokens)
* **Image Upload:** ImageKit
* **Email Service:** Nodemailer
* **Logging:** Morgan
* **Security:** Helmet, Rate Limiting, CORS
* **Testing:** Jest, Supertest

---

## 📁 Project Structure

```
BLOG-BACKEND
│
├── node_modules
├── src
│   ├── config
│   │   ├── db.js
│   │   └── ImageKit.upload.js
│   │
│   ├── controllers
│   │   ├── auth.controller.js
│   │   └── post.controller.js
│   │
│   ├── middlewares
│   │   ├── auth.js
│   │   ├── catchAsyncError.js
│   │   └── error.js
│   │
│   ├── models
│   │   ├── Comment.model.js
│   │   ├── Post.model.js
│   │   └── User.model.js
│   │
│   ├── routes
│   │   ├── auth.routes.js
│   │   └── post.routes.js
│   │
│   ├── utils
│   │   ├── generateEmailTemplate.js
│   │   ├── sendEmail.js
│   │   └── sendToken.js
│   │
│   └── app.js
│
├── .env
├── .gitignore
├── API_DOCUMENTATION.md
├── package.json
├── package-lock.json
├── Readme.md
└── server.js
```

---

## ⚙️ Features

### 🔐 Authentication

* **User Registration** - Email verification with OTP
* **User Login** - JWT-based authentication with secure tokens
* **Email Verification** - OTP verification process
* **JWT Authentication** - Secure protected routes with JWT tokens
* **HTTP-only Cookies** - Token storage in secure cookies
* **Protected Routes** - Role-based access control
* **Token Handling** - Automatic token expiration and renewal

### 📝 Post Management

* **Create Post** - Create new blog posts with full metadata
* **Update Post** - Edit existing posts with version control
* **Delete Post** - Remove posts with authorization checks
* **Get Single Post** - Retrieve individual posts by slug
* **Get All Posts** - Retrieve posts with pagination and filtering
* **Slug Generation** - SEO-friendly URL slugs with duplicate handling
* **Scheduled Publishing** - Schedule posts for future publication
* **Post Status** - Draft, Published, Archived states
* **Categories** - Organize posts by 10 different categories
* **Tags** - Multiple tags per post for better organization
* **Reading Time** - Automatic calculation of article reading time
* **Search Functionality** - Full-text search across posts

### 👤 User Management

* **Get Current User Profile** - Retrieve authenticated user details
* **Get User by ID** - View public user profiles
* **Secure Password Handling** - Bcrypt password hashing
* **Profile Updates** - Edit name, bio, and social links
* **Avatar Management** - Profile picture upload and storage
* **Social Links** - Twitter, GitHub, LinkedIn, Website links
* **User Status** - Active/Inactive account management
* **Account Blocking** - Block/Unblock user functionality
* **Last Login Tracking** - Track user's last login timestamp
* **Email Verification** - Email verification code management
* **Password Reset** - Forgot password with secure token reset
* **Password Change** - Authenticated password change
* **Account Deletion** - Delete account with confirmation
* **User Stats** - Total posts, followers, following counts

### ❤️ Comments

* **Like / Unlike Posts** - Toggle like on posts
* **Like Counter** - Real-time like count tracking
* **Interaction Tracking** - Track which users liked posts
* **Save / Unsave Posts** - Save posts for later reading
* **Save Counter** - Track saved post counts
* **Like Notifications** - Notify users of post likes
* **Follow / Unfollow Users** - Follow other users
* **Follower Management** - Track followers and following
* **Follow Counter** - Display follower/following counts
* **User Blocking** - Block users from viewing profile

### 🖼 Image Upload

* **Profile Image Upload** - ImageKit integration for profile pictures

### 📧 Email System

* **Email Sending** - Resend email service integration
* **Email Templates** - Custom HTML email templates
* **Verification Emails** - Send OTP verification emails
* **Password Reset Emails** - Send password reset links

### 🔍 Advanced Search & Filtering

* **Full-Text Search** - Search across title, content, description
* **Tag Filtering** - Filter posts by tags
* **Category Filtering** - Filter posts by category
* **Author Filtering** - View specific author's posts
* **Popularity Sorting** - Sort by views and likes
* **Featured Posts** - Filter featured content
* **Search Pagination** - Paginated search results


### 🔒 Security Best Practices

* **JWT Authentication** - Secure token-based auth
* **HTTP-only Cookies** - Prevent XSS attacks
* **Password Hashing** - Bcrypt with salt rounds
* **Environment-based Configuration** - Secure config management
* **Rate Limiting** - Prevent brute force and DoS attacks
* **CORS Configuration** - Restrict cross-origin requests
* **Helmet Security Headers** - HTTP security headers
* **Input Sanitization** - NoSQL injection prevention
* **Token Expiration** - Automatic token refresh

---

## 🔧 Environment Variables (.env)

Create a `.env` file in the root directory:

```
# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# ImageKit Configuration (for image uploads)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint

# Email Configuration 
EMAIL_SERVICE=resend
GMAIL_USER=****@gmail.com
GMAIL_PASS=**** **** **** ****
RESEND_API_KEY=****************

```

---

## ▶️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone <repository_url>
cd blog-backend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create .env file

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4️⃣ Run in development

```bash
npm run dev
```

Server runs on: `http://localhost:4000`

### 5️⃣ Run in production

```bash
npm start
```

---

## 📡 API Routes Overview

### Authentication Routes (`/api/v1/auth`)

#### Public Routes
* **POST** `/register` - User registration with email verification
* **POST** `/verify-otp` - Verify email with OTP
* **POST** `/resend-otp` - Resend verification OTP
* **POST** `/login` - User login
* **POST** `/forgot-password` - Request password reset
* **POST** `/reset-password/:token` - Reset password with token
* **GET** `/:id` - Get user profile by ID

#### Protected Routes
* **POST** `/logout` - User logout
* **GET** `/me/profile` - Get current user profile
* **PUT** `/me/update-profile` - Update user profile
* **POST** `/me/upload-profile-image` - Upload profile picture
* **POST** `/me/change-password` - Change password
* **POST** `/me/delete-account` - Delete user account
* **POST** `/me/follow/:userId` - Follow/Unfollow user

### Post Routes (`/api/v1/posts`)

#### Public Routes
* **GET** `/` - Get all posts with pagination, filtering & sorting
* **GET** `/top` - Get top/trending posts
* **GET** `/featured` - Get featured posts
* **GET** `/search` - Search posts by query
* **GET** `/article/:slug` - Get single post by slug
* **GET** `/category/:category` - Get posts by category
* **GET** `/author/:authorId` - Get posts by specific author
* **GET** `/tag/:tag` - Get posts by specific tag

#### Protected Routes
* **POST** `/create` - Create new post (draft or publish)
* **GET** `/me/posts` - Get current user's posts
* **PUT** `/:id` - Update post
* **DELETE** `/:id` - Delete post
* **POST** `/:id/like` - Like/Unlike post
* **POST** `/:id/save` - Save/Unsave post
* **POST** `/admin/publish-scheduled` - Publish scheduled posts (Admin only)

---

## 🧪 Testing

Run tests using:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Make sure `NODE_ENV=test` is configured properly in `.env`.

---

## 🔐 Security Best Practices Implemented

* ✅ **JWT Authentication** - Stateless secure authentication
* ✅ **HTTP-only Cookies** - Secure token storage
* ✅ **Password Hashing** - Bcrypt with salt rounds (10)
* ✅ **Centralized Error Handling** - Prevent information leakage
* ✅ **Environment-based Configuration** - Secure credential management
* ✅ **Rate Limiting** - Prevent brute force attacks (20-100 req/15min)
* ✅ **CORS Configuration** - Restrict cross-origin requests
* ✅ **Helmet Security Headers** - HTTP security headers
* ✅ **Input Sanitization** - NoSQL injection prevention
* ✅ **Token Expiration** - Automatic token refresh (7 days)
* ✅ **Role-based Access Control** - User, Admin, Moderator roles
* ✅ **Request Validation** - Input validation on all routes

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📜 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🎉 Acknowledgments

* Express.js community
* MongoDB documentation
* JWT best practices
* RESTful API design guidelines

---

**Version:** 1.0.0  
**Last Updated:** March 18, 2025  
**Status:** ✅ Production Ready