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
  const reviewCount = await this.find({ blog: blogId }).countDocuments();
  await Blog.findByIdAndUpdate(blogId, { reviewCount: reviewCount });
};

reviewSchema.post("save", function () {
  this.constructor.calculateReviews(this.blog);
});

// Neither findByIdAndUpdate norfindByIdAndDelete have access to document middleware.
// They only get access to query middleware
// Inside this hook, this will point to the current query, not the current review.
// Therefore, to access the review, we’ll need to execute the query
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.doc = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.doc.constructor.calculateReviews(this.doc.blog);
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
