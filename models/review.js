const mongoose = require("mongoose");
const Blog = require("./blog");
const Schema = mongoose.Schema;

const reviewSchema = Schema({
  content: { type: String, required: true },
  user: { type: Schema.ObjectId, required: true, ref: "User" },
  blog: { type: Schema.ObjectId, required: true, ref: "Blog" },
  reactions: {
    laugh: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
  },
});

reviewSchema.statics.calculateReviews = async function (blogId) {
  const reviewCount = await this.find({ blog: blogId }).count();
  await Blog.findByIdAndUpdate(blogId, { reviewCount: reviewCount });
};

reviewSchema.post("save", function () {
  this.constructor.calculateReviews(this.blog);
});

module.exports = mongoose.model("Review", reviewSchema);
