const utilsHelper = require("../helpers/utils.helper");
const Blog = require("../models/blog");
const blogController = {};

blogController.getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);
    const offset = limit * (page - 1);

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    return utilsHelper.sendResponse(
      res,
      200,
      true,
      { blogs, totalPages },
      null,
      ""
    );
  } catch (error) {
    next(error);
  }
};

blogController.getSingleBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(new Error("Blog not found"));

    return utilsHelper.sendResponse(res, 200, true, blog, null, null);
  } catch (error) {
    next(error);
  }
};

blogController.createNewBlog = async (req, res, next) => {
  try {
    const author = req.userId;
    const { title, content } = req.body;

    const blog = await Blog.create({
      title,
      content,
      author,
    });

    return utilsHelper.sendResponse(
      res,
      200,
      true,
      blog,
      null,
      "Create new blog successful"
    );
  } catch (error) {
    next(error);
  }
};

blogController.updateSingleBlog = async (req, res, next) => {
  try {
    const author = req.userId;
    const blogId = req.params.id;
    const { title, content } = req.body;

    const blog = await Blog.findOneAndUpdate(
      { _id: blogId, author: author },
      { title, content },
      { new: true }
    );
    if (!blog) return next(new Error("Blog not found or User not authorized"));
    return utilsHelper.sendResponse(
      res,
      200,
      true,
      blog,
      null,
      "Update successful"
    );
  } catch (error) {
    next(error);
  }
};

blogController.deleteSingleBlog = async (req, res, next) => {
  try {
    const author = req.userId;
    const blogId = req.params.id;

    const blog = await Blog.findOneAndUpdate(
      { _id: blogId, author: author },
      { isDeleted: true },
      { new: true }
    );
    if (!blog) return next(new Error("Blog not found or User not authorized"));
    return utilsHelper.sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Delete successful"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = blogController;
