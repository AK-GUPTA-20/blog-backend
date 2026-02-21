# Blog-Backend

A scalable and production-ready RESTful backend API for a blogging platform. This project provides authentication, post management, user management, interactions, image uploads, email utilities, and robust error handling using Node.js, Express, and MongoDB.

---

## 🚀 Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* ImageKit (for image uploads)
* Nodemailer (for email services)
* Morgan (logging)
* Jest (testing)

---

## 📁 Project Structure

```
BLOG-BACKEND
│
├── node_modules
├── src
│   ├── config
│   │   ├── db.js
│   │   └── imageKit.upload.js
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
│   │   ├── interaction.model.js
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
├── package.json
├── package-lock.json
└── server.js
```

---

## ⚙️ Features

### 🔐 Authentication

* User registration
* User login
* JWT-based authentication
* Protected routes
* Token handling via cookies

### 📝 Post Management

* Create post
* Update post
* Delete post
* Get single post
* Get all posts
* Slug generation for SEO-friendly URLs

### 👤 User Management

* Get current user profile
* Secure password handling

### ❤️ Interactions

* Like / Unlike posts
* Interaction tracking per user

### 🖼 Image Upload

* Image upload integration using ImageKit
* Cloud storage management

### 📧 Email System

* Email sending utility
* Custom email template generation

### 🛡 Error Handling

* Centralized error middleware
* Async error wrapper
* Production-ready error responses

---

## 🔧 Environment Variables (.env)

Create a `.env` file in the root directory and add:

```
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_email_password
```

---

## ▶️ Installation & Setup

### 1️⃣ Clone the repository

```
git clone <repository_url>
cd blog-backend
```

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Run in development

```
npm run dev
```

### 4️⃣ Run in production

```
npm start
```

---

## 📡 API Routes Overview

### Auth Routes (`/api/auth`)

* POST /register
* POST /login
* GET /logout
* GET /me

### Post Routes (`/api/posts`)

* GET /
* GET /:slug
* POST /
* PUT /:id
* DELETE /:id
* POST /:id/like

---

## 🧪 Testing

Run tests using:

```
npm test
```

Make sure `NODE_ENV=test` is configured properly.

---

## 🏗 Architecture Overview

* `server.js` → Entry point
* `app.js` → Express configuration & middleware setup
* MVC Pattern:

  * Models → Database schema
  * Controllers → Business logic
  * Routes → API endpoints
  * Middlewares → Authentication & error handling
  * Utils → Helper functions

---

## 🔐 Security Best Practices Implemented

* JWT Authentication
* HTTP-only cookies
* Password hashing (bcrypt)
* Centralized error handling
* Environment-based configuration

---

## 📌 Future Improvements

* Role-based authorization (Admin/User)
* Pagination & filtering
* Comment system
* API documentation (Swagger)
* Docker support

---

## 👨‍💻 Author

Developed as a full-stack blogging backend system following best practices and clean architecture principles.

---

## 📜 License

This project is licensed under the MIT License.

---

If you found this project helpful, feel free to ⭐ the repository.
