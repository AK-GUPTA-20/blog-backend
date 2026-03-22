const jwt = require("jsonwebtoken");
const Comment = require("../models/Comment.model");
const Post = require("../models/Post.model");

// Store active users in posts
const activeUsers = new Map();
const postSubscribers = new Map();

exports.initializeCommentSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.userId = decoded.id;
      socket.userName = socket.handshake.auth.userName;
      socket.userAvatar = socket.handshake.auth.userAvatar;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.userId} - ${socket.id}`);

    // Store user connection
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      userName: socket.userName,
      userAvatar: socket.userAvatar,
    });

    // ==================== COMMENT EVENTS ====================

    // Subscribe to post comments
    socket.on("subscribe_post_comments", (data) => {
      const { postId } = data;
      const roomName = `post_comments_${postId}`;

      socket.join(roomName);

      // Track subscribers
      if (!postSubscribers.has(postId)) {
        postSubscribers.set(postId, new Set());
      }
      postSubscribers.get(postId).add(socket.userId);

      const subscriberCount = postSubscribers.get(postId).size;

      console.log(
        `👤 User ${socket.userId} subscribed to post ${postId} comments (Total: ${subscriberCount})`
      );

      // Notify others
      io.to(roomName).emit("user_joined_comments", {
        userId: socket.userId,
        userName: socket.userName,
        userAvatar: socket.userAvatar,
        totalSubscribers: subscriberCount,
      });
    });

    // Unsubscribe from post comments
    socket.on("unsubscribe_post_comments", (data) => {
      const { postId } = data;
      const roomName = `post_comments_${postId}`;

      socket.leave(roomName);

      if (postSubscribers.has(postId)) {
        postSubscribers.get(postId).delete(socket.userId);
      }

      const subscriberCount = postSubscribers.get(postId)?.size || 0;

      console.log(
        `👋 User ${socket.userId} unsubscribed from post ${postId} comments (Total: ${subscriberCount})`
      );

      io.to(roomName).emit("user_left_comments", {
        userId: socket.userId,
        totalSubscribers: subscriberCount,
      });
    });

    // Send new comment in real-time
    socket.on("send_comment", async (data) => {
      try {
        const { postId, content, parentCommentId } = data;

        // Validate post exists
        const post = await Post.findById(postId);
        if (!post) {
          socket.emit("comment_error", {
            error: "Post not found",
          });
          return;
        }

        // Create comment
        let commentData = {
          content,
          author: socket.userId,
          post: postId,
        };

        if (parentCommentId) {
          commentData.parentComment = parentCommentId;
        }

        const comment = await Comment.create(commentData);
        await comment.populate("author", "name avatar role");

        // Update post comment count
        post.stats.commentsCount += 1;
        await post.save({ validateModifiedOnly: true });

        const roomName = `post_comments_${postId}`;

        // Broadcast to all subscribers
        io.to(roomName).emit("new_comment_received", {
          comment: comment.toObject(),
          postId,
        });

        socket.emit("comment_sent_success", {
          commentId: comment._id,
          message: "Comment sent successfully",
        });

        console.log(`💬 New comment created in post ${postId}`);
      } catch (error) {
        socket.emit("comment_error", {
          error: error.message,
        });
        console.error("Error sending comment:", error.message);
      }
    });

    // Edit comment in real-time
    socket.on("edit_comment", async (data) => {
      try {
        const { commentId, content, postId } = data;

        const comment = await Comment.findById(commentId);
        if (!comment || comment.isDeleted) {
          socket.emit("comment_error", {
            error: "Comment not found",
          });
          return;
        }

        // Check authorization
        if (comment.author.toString() !== socket.userId) {
          socket.emit("comment_error", {
            error: "You are not authorized to edit this comment",
          });
          return;
        }

        comment.content = content;
        comment.isEdited = true;
        comment.editedAt = new Date();

        await comment.save({ validateModifiedOnly: true });
        await comment.populate("author", "name avatar role");

        const roomName = `post_comments_${postId}`;

        io.to(roomName).emit("comment_updated", {
          comment: comment.toObject(),
          postId,
        });

        socket.emit("comment_edit_success", {
          commentId: comment._id,
          message: "Comment updated successfully",
        });

        console.log(`✏️ Comment ${commentId} updated`);
      } catch (error) {
        socket.emit("comment_error", {
          error: error.message,
        });
        console.error("Error editing comment:", error.message);
      }
    });

    // Delete comment in real-time (user soft delete)
    socket.on("delete_comment", async (data) => {
      try {
        const { commentId, postId } = data;

        const comment = await Comment.findById(commentId);
        if (!comment) {
          socket.emit("comment_error", {
            error: "Comment not found",
          });
          return;
        }

        // Check authorization
        if (comment.author.toString() !== socket.userId) {
          socket.emit("comment_error", {
            error: "You are not authorized to delete this comment",
          });
          return;
        }

        // Soft delete
        comment.isDeleted = true;
        comment.content = "[deleted]";
        comment.deletedAt = new Date();
        comment.deletedBy = socket.userId;
        await comment.save({ validateModifiedOnly: true });

        // Update post comment count
        const post = await Post.findById(postId);
        if (post) {
          post.stats.commentsCount = Math.max(0, post.stats.commentsCount - 1);
          await post.save({ validateModifiedOnly: true });
        }

        const roomName = `post_comments_${postId}`;

        io.to(roomName).emit("comment_deleted", {
          commentId,
          postId,
        });

        socket.emit("comment_delete_success", {
          commentId,
          message: "Comment deleted successfully",
        });

        console.log(`🗑️ Comment ${commentId} deleted (soft delete)`);
      } catch (error) {
        socket.emit("comment_error", {
          error: error.message,
        });
        console.error("Error deleting comment:", error.message);
      }
    });

    // Admin force delete comment
    socket.on("admin_force_delete_comment", async (data) => {
      try {
        const { commentId, postId, reason } = data;

        // Check if user is admin
        const Comment_Model = require("../models/Comment.model");
        const User_Model = require("../models/User.model");

        const user = await User_Model.findById(socket.userId);
        if (!user || user.role !== "admin") {
          socket.emit("comment_error", {
            error: "Only admin can force delete comments",
          });
          return;
        }

        const comment = await Comment_Model.findById(commentId);
        if (!comment) {
          socket.emit("comment_error", {
            error: "Comment not found",
          });
          return;
        }

        // Store post info before deletion
        const postIdToUpdate = comment.post;

        // Force delete
        await Comment_Model.findByIdAndDelete(commentId);

        // Update post comment count
        const post = await Post.findById(postIdToUpdate);
        if (post) {
          post.stats.commentsCount = Math.max(0, post.stats.commentsCount - 1);
          await post.save({ validateModifiedOnly: true });
        }

        const roomName = `post_comments_${postIdToUpdate}`;

        io.to(roomName).emit("comment_force_deleted", {
          commentId,
          postId: postIdToUpdate,
          reason: reason || "No reason provided",
          deletedByAdmin: true,
        });

        socket.emit("admin_delete_success", {
          commentId,
          message: "Comment permanently deleted",
        });

        console.log(`🔨 Comment ${commentId} force deleted by admin`);
      } catch (error) {
        socket.emit("comment_error", {
          error: error.message,
        });
        console.error("Error force deleting comment:", error.message);
      }
    });

    // Like comment in real-time
    socket.on("like_comment", async (data) => {
      try {
        const { commentId, postId } = data;

        const comment = await Comment.findById(commentId);
        if (!comment || comment.isDeleted) {
          socket.emit("comment_error", {
            error: "Comment not found",
          });
          return;
        }

        const isLiked = comment.likedBy.includes(socket.userId);

        if (isLiked) {
          comment.likedBy.pull(socket.userId);
          comment.likes = Math.max(0, comment.likes - 1);
        } else {
          comment.likedBy.push(socket.userId);
          comment.likes += 1;
        }

        await comment.save({ validateModifiedOnly: true });

        const roomName = `post_comments_${postId}`;

        io.to(roomName).emit("comment_liked", {
          commentId,
          likes: comment.likes,
          isLiked: !isLiked,
          userId: socket.userId,
          postId,
        });

        console.log(
          `❤️ Comment ${commentId} ${isLiked ? "unliked" : "liked"} by user ${socket.userId}`
        );
      } catch (error) {
        socket.emit("comment_error", {
          error: error.message,
        });
        console.error("Error liking comment:", error.message);
      }
    });

    // User typing indicator
    socket.on("user_typing_comment", (data) => {
      const { postId } = data;
      const roomName = `post_comments_${postId}`;

      socket.to(roomName).emit("user_typing", {
        userId: socket.userId,
        userName: socket.userName,
        userAvatar: socket.userAvatar,
      });
    });

    // User stopped typing
    socket.on("user_stop_typing_comment", (data) => {
      const { postId } = data;
      const roomName = `post_comments_${postId}`;

      socket.to(roomName).emit("user_stop_typing", {
        userId: socket.userId,
      });
    });

    // ==================== DISCONNECT ====================

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      activeUsers.delete(socket.userId);

      // Remove from all post subscribers
      postSubscribers.forEach((subscribers, postId) => {
        if (subscribers.has(socket.userId)) {
          subscribers.delete(socket.userId);
          const roomName = `post_comments_${postId}`;
          io.to(roomName).emit("user_left_comments", {
            userId: socket.userId,
            totalSubscribers: subscribers.size,
          });
        }
      });
    });

    // Error handler
    socket.on("error", (error) => {
      console.error(`⚠️ Socket error for user ${socket.userId}:`, error);
    });
  });
};

// Helper function to get active users in a post
exports.getActiveUsersInPost = (postId) => {
  return postSubscribers.get(postId)?.size || 0;
};