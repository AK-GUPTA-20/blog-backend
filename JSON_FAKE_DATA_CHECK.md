{
	"info": {
		"_postman_id": "b1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
		"name": "🚀 Blog Backend API(locally) ",
		"description": "Complete Postman collection for the Blog Backend API. Includes authentication, post management, and comments management. include 27 endpoints .",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"item": [
		{
			"name": "1. Auth (Public)",
			"item": [
				{
					"name": "Register User",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\": \"Vaboha Paylaar\",\n    \"email\": \"vaboha4177@paylaar.com\",\n    \"password\": \"securePassword123\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/auth/register",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "register"]
						}
					}
				},
				{
					"name": "Verify OTP",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"email\": \"vaboha4177@paylaar.com\",\n    \"otp\": \"123456\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/auth/verify-otp",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "verify-otp"]
						}
					}
				},
				{
					"name": "Resend OTP",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"email\": \"vaboha4177@paylaar.com\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/auth/resend-otp",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "resend-otp"]
						}
					}
				},
				{
					"name": "Login User",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"email\": \"vaboha4177@paylaar.com\",\n    \"password\": \"securePassword123\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/auth/login",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "login"]
						}
					}
				},
				{
					"name": "Forgot Password",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"email\": \"vaboha4177@paylaar.com\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/auth/forgot-password",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "forgot-password"]
						}
					}
				},
				{
					"name": "Reset Password",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"password\": \"newSecurePassword456\",\n    \"confirmPassword\": \"newSecurePassword456\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/auth/reset-password/sample-reset-token-123",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "reset-password", "sample-reset-token-123"]
						}
					}
				},
				{
					"name": "Get User Profile by ID",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/auth/64f1b2c3d4e5f6a7b8c9d0e1",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "64f1b2c3d4e5f6a7b8c9d0e1"]
						}
					}
				}
			]
		},
		{
			"name": "2. Auth (Protected)",
			"item": [
				{
					"name": "Get Current User Profile",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/auth/me/profile",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "me", "profile"]
						}
					}
				},
				{
					"name": "Update Profile",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\": \"Vaboha Updated\",\n    \"bio\": \"Passionate Backend Developer & Tech Blogger\",\n    \"socialLinks\": {\n        \"twitter\": \"https://twitter.com/vaboha\",\n        \"github\": \"https://github.com/vaboha\",\n        \"linkedin\": \"https://linkedin.com/in/vaboha\"\n    },\n    \"preferences\": {\n        \"emailNotifications\": true,\n        \"privateProfile\": false\n    }\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/auth/me/update-profile",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "me", "update-profile"]
						}
					}
				},
				{
					"name": "Upload Profile Image",
					"request": {
						"method": "POST",
						"header": [],
						"body": {
							"mode": "formdata",
							"formdata": [
								{
									"key": "image",
									"type": "file",
									"description": "Select an image file from your computer here."
								}
							]
						},
						"url": {
							"raw": "{{baseUrl}}/auth/me/upload-profile-image",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "me", "upload-profile-image"]
						}
					}
				},
				{
					"name": "Change Password",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"currentPassword\": \"securePassword123\",\n    \"newPassword\": \"newSecurePassword456\",\n    \"confirmPassword\": \"newSecurePassword456\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/auth/me/change-password",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "me", "change-password"]
						}
					}
				},
				{
					"name": "Follow / Unfollow User",
					"request": {
						"method": "POST",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/auth/me/follow/64f1b2c3d4e5f6a7b8c9d0e1",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "me", "follow", "64f1b2c3d4e5f6a7b8c9d0e1"]
						}
					}
				},
				{
					"name": "Logout",
					"request": {
						"method": "POST",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/auth/logout",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "logout"]
						}
					}
				},
				{
					"name": "Delete Account",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"password\": \"securePassword123\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/auth/me/delete-account",
							"host": ["{{baseUrl}}"],
							"path": ["auth", "me", "delete-account"]
						}
					}
				}
			],
			"auth": {
				"type": "bearer",
				"bearer": [
					{
						"key": "token",
						"value": "{{token}}",
						"type": "string"
					}
				]
			}
		},
		{
			"name": "3. Posts (Public)",
			"item": [
				{
					"name": "Get All Posts",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts?page=1&limit=10&sort=newest",
							"host": ["{{baseUrl}}"],
							"path": ["posts"],
							"query": [
								{ "key": "page", "value": "1" },
								{ "key": "limit", "value": "10" },
								{ "key": "sort", "value": "newest" }
							]
						}
					}
				},
				{
					"name": "Get Top / Trending Posts",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts/top",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "top"]
						}
					}
				},
				{
					"name": "Get Featured Posts",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts/featured",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "featured"]
						}
					}
				},
				{
					"name": "Search Posts",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts/search?q=Nodejs",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "search"],
							"query": [
								{ "key": "q", "value": "Nodejs" }
							]
						}
					}
				},
				{
					"name": "Get Single Post by Slug",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts/article/my-first-blog-post",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "article", "my-first-blog-post"]
						}
					}
				},
				{
					"name": "Get Posts by Category",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts/category/Technology",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "category", "Technology"]
						}
					}
				},
				{
					"name": "Get Posts by Author",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts/author/64f1b2c3d4e5f6a7b8c9d0e1",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "author", "64f1b2c3d4e5f6a7b8c9d0e1"]
						}
					}
				},
				{
					"name": "Get Posts by Tag",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts/tag/Nodejs",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "tag", "Nodejs"]
						}
					}
				}
			]
		},
		{
			"name": "4. Posts (Protected)",
			"item": [
				{
					"name": "Create Post",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"title\": \"Scaling Node.js Backends in 2024\",\n    \"content\": \"This is the comprehensive content of my post covering performance optimizations, clustering, and caching strategies for Node.js applications.\",\n    \"description\": \"Learn how to scale Node.js backends efficiently\",\n    \"category\": \"Technology\",\n    \"tags\": [\"nodejs\", \"backend\", \"scalability\"],\n    \"status\": \"published\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/posts/create",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "create"]
						}
					}
				},
				{
					"name": "Get My Posts",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts/me/posts",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "me", "posts"]
						}
					}
				},
				{
					"name": "Update Post",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"title\": \"Scaling Node.js Backends (Updated 2024)\",\n    \"status\": \"draft\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/posts/64f1b2c3d4e5f6a7b8c9d0e2",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "64f1b2c3d4e5f6a7b8c9d0e2"]
						}
					}
				},
				{
					"name": "Like / Unlike Post",
					"request": {
						"method": "POST",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts/64f1b2c3d4e5f6a7b8c9d0e2/like",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "64f1b2c3d4e5f6a7b8c9d0e2", "like"]
						}
					}
				},
				{
					"name": "Save / Unsave Post",
					"request": {
						"method": "POST",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts/64f1b2c3d4e5f6a7b8c9d0e2/save",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "64f1b2c3d4e5f6a7b8c9d0e2", "save"]
						}
					}
				},
				{
					"name": "Delete Post",
					"request": {
						"method": "DELETE",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts/64f1b2c3d4e5f6a7b8c9d0e2",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "64f1b2c3d4e5f6a7b8c9d0e2"]
						}
					}
				}
			],
			"auth": {
				"type": "bearer",
				"bearer": [
					{
						"key": "token",
						"value": "{{token}}",
						"type": "string"
					}
				]
			}
		},
		{
			"name": "5. Posts (Admin)",
			"item": [
				{
					"name": "Publish Scheduled Posts (Admin Only)",
					"request": {
						"method": "POST",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/posts/admin/publish-scheduled",
							"host": ["{{baseUrl}}"],
							"path": ["posts", "admin", "publish-scheduled"]
						}
					}
				}
			],
			"auth": {
				"type": "bearer",
				"bearer": [
					{
						"key": "token",
						"value": "{{adminToken}}",
						"type": "string"
					}
				]
			}
		},
		{
			"name": "6. Comments (Public)",
			"item": [
				{
					"name": "Get All Comments on a Post",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/comments/post/65f3c2a8b1c2d3e4f5g6h7i9?page=1&limit=10",
							"host": ["{{baseUrl}}"],
							"path": ["comments", "post", "65f3c2a8b1c2d3e4f5g6h7i9"],
							"query": [
								{ "key": "page", "value": "1" },
								{ "key": "limit", "value": "10" }
							]
						}
					}
				},
				{
					"name": "Get Single Comment",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/comments/65f3c2a8b1c2d3e4f5g6h7i8",
							"host": ["{{baseUrl}}"],
							"path": ["comments", "65f3c2a8b1c2d3e4f5g6h7i8"]
						}
					}
				},
				{
					"name": "Get Comment Replies",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/comments/65f3c2a8b1c2d3e4f5g6h7i8/replies?page=1&limit=5",
							"host": ["{{baseUrl}}"],
							"path": ["comments", "65f3c2a8b1c2d3e4f5g6h7i8", "replies"],
							"query": [
								{ "key": "page", "value": "1" },
								{ "key": "limit", "value": "5" }
							]
						}
					}
				}
			]
		},
		{
			"name": "7. Comments (Protected)",
			"item": [
				{
					"name": "Create Comment",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"content\": \"This is an amazing article!\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/comments/post/65f3c2a8b1c2d3e4f5g6h7i9/create",
							"host": ["{{baseUrl}}"],
							"path": ["comments", "post", "65f3c2a8b1c2d3e4f5g6h7i9", "create"]
						}
					}
				},
				{
					"name": "Reply to Comment",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"content\": \"I agree with you!\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/comments/65f3c2a8b1c2d3e4f5g6h7i8/reply",
							"host": ["{{baseUrl}}"],
							"path": ["comments", "65f3c2a8b1c2d3e4f5g6h7i8", "reply"]
						}
					}
				},
				{
					"name": "Update Comment",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"content\": \"Updated comment text\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/comments/65f3c2a8b1c2d3e4f5g6h7i8",
							"host": ["{{baseUrl}}"],
							"path": ["comments", "65f3c2a8b1c2d3e4f5g6h7i8"]
						}
					}
				},
				{
					"name": "Delete Comment (Soft Delete)",
					"request": {
						"method": "DELETE",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/comments/65f3c2a8b1c2d3e4f5g6h7i8",
							"host": ["{{baseUrl}}"],
							"path": ["comments", "65f3c2a8b1c2d3e4f5g6h7i8"]
						}
					}
				},
				{
					"name": "Like / Unlike Comment",
					"request": {
						"method": "POST",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/comments/65f3c2a8b1c2d3e4f5g6h7i8/like",
							"host": ["{{baseUrl}}"],
							"path": ["comments", "65f3c2a8b1c2d3e4f5g6h7i8", "like"]
						}
					}
				}
			],
			"auth": {
				"type": "bearer",
				"bearer": [
					{
						"key": "token",
						"value": "{{token}}",
						"type": "string"
					}
				]
			}
		},
		{
			"name": "8. Comments (Admin)",
			"item": [
				{
					"name": "Get All Comments (Admin Only)",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/comments/admin/get-all/comments?page=1&limit=20&isDeleted=false",
							"host": ["{{baseUrl}}"],
							"path": ["comments", "admin", "get-all", "comments"],
							"query": [
								{ "key": "page", "value": "1" },
								{ "key": "limit", "value": "20" },
								{ "key": "isDeleted", "value": "false" }
							]
						}
					}
				},
				{
					"name": "Force Delete Comment (Admin Only)",
					"request": {
						"method": "DELETE",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"reason\": \"Spam content\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/comments/admin/delete/65f3c2a8b1c2d3e4f5g6h7i8/force",
							"host": ["{{baseUrl}}"],
							"path": ["comments", "admin", "delete", "65f3c2a8b1c2d3e4f5g6h7i8", "force"]
						}
					}
				}
			],
			"auth": {
				"type": "bearer",
				"bearer": [
					{
						"key": "token",
						"value": "{{adminToken}}",
						"type": "string"
					}
				]
			}
		}
	],
	"variable": [
		{
			"key": "baseUrl",
			"value": "http://localhost:5000/api/v1",
			"type": "string"
		},
		{
			"key": "token",
			"value": "your_jwt_token_here",
			"type": "string"
		},
		{
			"key": "adminToken",
			"value": "your_admin_jwt_token_here",
			"type": "string"
		}
	]
}