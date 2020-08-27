const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  reactions: {
    laugh: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
  },
  reviewCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
});

blogSchema.plugin(require("./plugins/isDeletedFalse"));

module.exports = mongoose.model("Blog", blogSchema);
