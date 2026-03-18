# Blog Backend

## Project Structure

```
- src/
   - controllers/
   - models/
   - routes/
   - middleware/
   - utils/
- config/
- tests/
- .env
- package.json
- README.md
```

## Routes

- `/api/posts` - For handling blog posts  
- `/api/users` - For handling user authentication and management  
- `/api/comments` - For managing comments on blog posts

## APIs

### Posts
- `GET /api/posts` - Get all posts  
- `GET /api/posts/:id` - Get a single post by ID  
- `POST /api/posts` - Create a new post  
- `PUT /api/posts/:id` - Update an existing post  
- `DELETE /api/posts/:id` - Delete a post

### Users
- `POST /api/users/register` - Register a user  
- `POST /api/users/login` - Login a user  
- `GET /api/users/profile` - Get user profile

## Backend URLs

- Limited Access API: [https://apiv1.tech/](https://apiv1.tech/)  
- Live Blog Backend: [https://blog-backend-mueu.onrender.com/](https://blog-backend-mueu.onrender.com/) 

## Current Date and Time

Date: 2026-03-18 06:35:55 UTC

---
