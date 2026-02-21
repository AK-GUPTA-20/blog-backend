const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["like", "comment"],
      required: true,
    },

    commentText: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);


interactionSchema.index(
  { post: 1, user: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "like" } }
);

module.exports = mongoose.model("Interaction", interactionSchema);
