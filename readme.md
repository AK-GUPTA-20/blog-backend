# 📝 Blog Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-v5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-v7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-v4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A production-ready, feature-rich RESTful blog backend built with Node.js, Express, and MongoDB.**

[Live API (Render)](https://blog-backend-mueu.onrender.com/) · [Live API (Custom Domain)](https://apiv1.tech/) · [API Reference](#-api-reference)

</div>

---

## 🌐 Live Deployments

| Environment | URL | Status |
|---|---|---|
| Render (Primary) | `https://blog-backend-mueu.onrender.com` | ✅ Live |
| Custom Domain | `https://apiv1.tech` | ✅ Live (valid until March 2027) |

> **Base path for all API calls:** `/api/v1`
>
> Example: `https://apiv1.tech/api/v1/auth/login`

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure cookie-based token auth with OTP email verification
- 📝 **Post Management** — Full CRUD with rich filtering, search, categories, tags, and scheduling
- 💬 **Real-time Comments** — Socket.io-powered live commenting with typing indicators and admin moderation
- 👥 **User Profiles** — Follow/unfollow system, profile images via ImageKit, social links
- 🛡️ **Security** — Helmet, CORS, CSRF protection, rate limiting per endpoint
- 📧 **Dual Email Support** — Gmail (Nodemailer) or Resend with a beautiful HTML verification template
- 🖼️ **Image Uploads** — ImageKit CDN integration for profile images
- 🧱 **Role-Based Access Control** — `user`, `moderator`, and `admin` roles
- 📊 **Post Analytics** — View counts, like tracking, reading time, view history
- 🔍 **Full-Text Search** — MongoDB text indexes across titles, content, and descriptions

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 20 |
| Framework | Express v5 |
| Database | MongoDB + Mongoose v9 |
| Real-time | Socket.io v4 |
| Authentication | JWT + bcryptjs |
| File Storage | ImageKit |
| Email | Nodemailer / Resend |
| Security | Helmet, csurf, express-rate-limit |
| Validation | express-validator |
| Logging | Morgan |
| Dev Tools | Nodemon, Supertest |

---

## 📁 Project Structure

```
blog-backend/
├── server.js                   # Entry point — HTTP server & Socket.io bootstrap
├── src/
│   ├── app.js                  # Express app setup, middleware, routes
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── cors.js             # CORS configuration
│   │   ├── environment.js      # Env variable validation
│   │   ├── ImageKit.upload.js  # ImageKit + Multer config
│   │   └── socket-comments.js  # Socket.io real-time comment logic
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── post.controller.js
│   │   └── comment.controller.js
│   ├── middlewares/
│   │   ├── auth.js             # isAuthenticated, isAdmin, isAuthorized
│   │   ├── error.js            # Global error handler + ErrorHandler class
│   │   ├── catchAsyncError.js  # Async error wrapper
│   │   └── comment.validation.js # express-validator rules
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Post.model.js
│   │   └── Comment.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── post.routes.js
│   │   └── comment.routes.js
│   └── utils/
│       ├── sendToken.js
│       ├── sendEmail.js
│       └── generateEmailTemplate.js
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 20`
- MongoDB (local or [Atlas](https://cloud.mongodb.com))
- ImageKit account
- Resend or Gmail account for emails

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd blog-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in all values in .env (see Environment Variables section)

# 4. Start in development mode
npm run dev

# 5. Start in production mode
npm start
```

The server will start on `http://localhost:5000` by default.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory. All variables below are required unless marked optional.

```env
# ── Server ──────────────────────────────────────────────
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ── Database ─────────────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/blog

# ── JWT ──────────────────────────────────────────────────
JWT_SECRET_KEY=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# ── ImageKit ─────────────────────────────────────────────
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# ── Email ─────────────────────────────────────────────────
EMAIL_SERVICE=resend          # "resend" or "nodemailer"
GMAIL_USER=your@gmail.com     # required if using nodemailer
GMAIL_PASS=your-app-password  # required if using nodemailer
RESEND_API_KEY=re_xxxxxxxxxxxx # required if using resend

# ── OTP / Security ────────────────────────────────────────
MAX_OTP_ATTEMPTS=5
OTP_VALIDITY_HOURS=12
OTP_LENGTH=6

# ── Socket.io ─────────────────────────────────────────────
SOCKET_RECONNECTION_DELAY=1000
SOCKET_RECONNECTION_DELAY_MAX=5000
SOCKET_RECONNECTION_ATTEMPTS=5
```

---

## 📡 API Reference

> **Base URL:** `https://apiv1.tech/api/v1`

All protected routes require a valid JWT cookie (`token`) obtained from login or OTP verification. Admin routes additionally require the user's `role` to be `"admin"`.

---

### 🔑 Authentication

#### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user + send OTP |
| `POST` | `/auth/verify-otp` | Verify email with OTP |
| `POST` | `/auth/resend-otp` | Resend OTP to email |
| `POST` | `/auth/login` | Login and receive token cookie |
| `POST` | `/auth/forgot-password` | Send password reset email |
| `POST` | `/auth/reset-password/:token` | Reset password with token |
| `GET`  | `/auth/:id` | Get public profile by user ID |

#### Protected Endpoints *(requires auth)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/auth/me/profile` | Get current authenticated user |
| `PUT`  | `/auth/me/update-profile` | Update name, bio, social links |
| `POST` | `/auth/me/upload-profile-image` | Upload avatar via multipart/form-data |
| `POST` | `/auth/me/change-password` | Change password |
| `POST` | `/auth/me/follow/:userId` | Follow or unfollow a user |
| `POST` | `/auth/logout` | Logout (clears cookie) |
| `POST` | `/auth/me/delete-account` | Permanently delete account |

---

### 📄 Posts

#### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/posts` | Get all published posts (paginated, filterable) |
| `GET`  | `/posts/top` | Get top posts by views |
| `GET`  | `/posts/featured` | Get featured posts |
| `GET`  | `/posts/search?q=` | Full-text search posts |
| `GET`  | `/posts/article/:slug` | Get single post by slug |
| `GET`  | `/posts/category/:category` | Posts by category |
| `GET`  | `/posts/author/:authorId` | Posts by a specific author |
| `GET`  | `/posts/tag/:tag` | Posts by tag |

**Query Parameters for `GET /posts`:**

| Param | Values | Description |
|-------|--------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Results per page (default: 10) |
| `sort` | `newest`, `popular`, `trending`, `oldest` | Sort order |
| `category` | string | Filter by category |
| `tag` | string | Filter by tag |
| `author` | ObjectId | Filter by author |

#### Protected Endpoints *(requires auth)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`   | `/posts/create` | Create a new post |
| `GET`    | `/posts/me/posts` | Get current user's posts |
| `PUT`    | `/posts/:id` | Update a post |
| `DELETE` | `/posts/:id` | Delete a post |
| `POST`   | `/posts/:id/like` | Like or unlike a post |
| `POST`   | `/posts/:id/save` | Save or unsave a post |

#### Admin Only

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/posts/admin/publish-scheduled` | Publish all due scheduled posts |

**Create / Update Post Body:**

```json
{
  "title": "Post Title (min 5 chars)",
  "content": "Full content (min 50 chars)",
  "description": "Short excerpt",
  "category": "Technology",
  "tags": ["nodejs", "backend"],
  "status": "draft | published | archived",
  "featuredImage": "https://...",
  "seoTitle": "SEO Title",
  "seoDescription": "SEO meta description",
  "seoKeywords": ["keyword1", "keyword2"]
}
```

**Valid Categories:** `Technology`, `Lifestyle`, `Travel`, `Food`, `Business`, `Health`, `Education`, `Entertainment`, `Sports`, `Other`

---

### 💬 Comments

#### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/comments/post/:postId` | Get all top-level comments for a post |
| `GET` | `/comments/:commentId` | Get a single comment with replies |
| `GET` | `/comments/:commentId/replies` | Get paginated replies for a comment |

#### Protected Endpoints *(requires auth)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`   | `/comments/post/:postId/create` | Create a comment on a post |
| `POST`   | `/comments/:commentId/reply` | Reply to a comment |
| `PUT`    | `/comments/:commentId` | Edit your own comment |
| `DELETE` | `/comments/:commentId` | Soft-delete your own comment |
| `POST`   | `/comments/:commentId/like` | Like or unlike a comment |

#### Admin Only

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/comments/admin/get-all/comments` | List all comments (with filters) |
| `DELETE` | `/comments/admin/delete/:commentId/force` | Permanently delete a comment |

---

## 🔌 Real-time Socket.io Events

Connect with a valid JWT token in the handshake:

```js
const socket = io("https://apiv1.tech", {
  auth: {
    token: "your_jwt_token",
    userName: "John",
    userAvatar: "https://..."
  }
});
```

### Emit (Client → Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe_post_comments` | `{ postId }` | Join a post's comment room |
| `unsubscribe_post_comments` | `{ postId }` | Leave a post's comment room |
| `send_comment` | `{ postId, content, parentCommentId? }` | Send a new comment |
| `edit_comment` | `{ commentId, content, postId }` | Edit an existing comment |
| `delete_comment` | `{ commentId, postId }` | Soft-delete a comment |
| `like_comment` | `{ commentId, postId }` | Toggle like on a comment |
| `user_typing_comment` | `{ postId }` | Broadcast typing indicator |
| `user_stop_typing_comment` | `{ postId }` | Stop typing indicator |
| `admin_force_delete_comment` | `{ commentId, postId, reason }` | Admin permanent delete |

### Listen (Server → Client)

| Event | Description |
|-------|-------------|
| `new_comment_received` | A new comment was posted |
| `comment_updated` | A comment was edited |
| `comment_deleted` | A comment was soft-deleted |
| `comment_force_deleted` | A comment was permanently deleted by admin |
| `comment_liked` | Like count updated on a comment |
| `comment_sent_success` | Confirmation your comment was saved |
| `user_joined_comments` | A user subscribed to the post's comments |
| `user_left_comments` | A user unsubscribed |
| `user_typing` | Someone is typing |
| `user_stop_typing` | Typing stopped |
| `comment_error` | Error event with message |
| `token_expired` | JWT expired; redirect to login |

---

## 🛡️ Security

- **Helmet** — Sets secure HTTP headers
- **CORS** — Wildcard in development, strict allowlist in production
- **Rate Limiting:**
  - Global: 100 req / 15 min
  - Auth routes: 20 req / 15 min
  - OTP verification: configurable via `MAX_OTP_ATTEMPTS`
- **Password hashing** — bcryptjs with salt rounds of 10
- **JWT** — HttpOnly secure cookies; tokens expire per `JWT_EXPIRE`
- **OTP brute-force protection** — Tracks attempts, locks after max tries

---

## 🚦 Response Format

All responses follow a consistent structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful.",
  "data": { ... }
}
```

**Paginated:**
```json
{
  "success": true,
  "total": 100,
  "page": 1,
  "pages": 10,
  "limit": 10,
  "data": [ ... ]
}
```

**Error:**
```json
{
  "success": false,
  "message": "Descriptive error message."
}
```

---

## 📊 Data Models Overview

### User
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | 2–50 chars |
| `email` | String | Unique, indexed |
| `password` | String | Hashed, never returned |
| `role` | Enum | `user`, `admin`, `moderator` |
| `isVerified` | Boolean | Requires OTP confirmation |
| `avatar` | String | ImageKit URL |
| `followers` / `following` | ObjectId[] | User references |
| `socialLinks` | Object | Twitter, GitHub, LinkedIn, Website |
| `preferences` | Object | Email notifications, private profile |

### Post
| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Max 200 chars, text-indexed |
| `slug` | String | Unique, auto-generated |
| `content` | String | Text-indexed |
| `status` | Enum | `draft`, `published`, `archived` |
| `stats` | Object | `views`, `likes`, `commentsCount`, `readingTime` |
| `category` | Enum | 10 categories |
| `tags` | String[] | Lowercase |
| `isFeatured` / `isPinned` | Boolean | Curated content flags |
| `scheduledFor` | Date | Scheduled publish date |
| `seoTitle` / `seoDescription` | String | SEO metadata |

### Comment
| Field | Type | Notes |
|-------|------|-------|
| `content` | String | Max 1000 chars |
| `author` | ObjectId | Ref User |
| `post` | ObjectId | Ref Post |
| `parentComment` | ObjectId | Null for top-level |
| `replies` | ObjectId[] | Child comments |
| `isDeleted` | Boolean | Soft delete flag |
| `isEdited` | Boolean | Edit tracking |
| `likes` / `likedBy` | Number / ObjectId[] | Like system |

---

## 📜 Scripts

```bash
npm run dev     # Start with nodemon (hot reload)
npm start       # Start in production mode
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👤 Author

**Akshat Gupta**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ using Node.js & Express

⭐ Star this repo if you found it helpful!

</div>
