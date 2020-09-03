const utilsHelper = require("../helpers/utils.helper");
const Blog = require("../models/blog");
const Review = require("../models/review");
const blogController = {};

blogController.getBlogs = async (req, res, next) => {
  try {
    console.log(req.query)
    // begin filter query
    let filter = { ...req.query }
    delete filter.limit
    delete filter.page
    delete filter.sortBy
    console.log(filter)
    // end

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalBlogs = await Blog.find(filter).countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);
    const offset = limit * (page - 1);

    // begin  sorting query
    const sortBy = req.query.sortBy || {};
    if (!sortBy.createdAt) {
      sortBy.createdAt = -1  // default sort
    }
    // end

    // const blogs = await Blog.find(filter)
    const blogs = await Blog.find(
      // tags: ["music", "sport"]
      filter
    )
      .sort(sortBy)
      .skip(offset)
      .limit(limit)
      .populate("author");


    return utilsHelper.sendResponse(
      res,
      200,
      true,
      { blogs,
         totalPages,
          totalResults: totalBlogs,
          currentPage: page
         },
      null,
      ""
    );
  } catch (error) {
    next(error);
  }
};

blogController.getSingleBlog = async (req, res, next) => {
  try {
    let blog = await Blog.findById(req.params.id).populate("author");
    if (!blog) return next(new Error("Blog not found"));
    blog = blog.toJSON();
    blog.reviews = await Review.find({ blog: blog._id }).populate("user");
    return utilsHelper.sendResponse(res, 200, true, blog, null, null);
  } catch (error) {
    next(error);
  }
};

blogController.createNewBlog = async (req, res, next) => {
  try {
    const author = req.userId;
    // remove un-allowed fields from body
    const allows = ["title", "content", "tags"];
    for (let key in req.body) {
      if (!allows.includes(key)) {
        delete req.body[key];
      }
    }
    const blog = await Blog.create({
      ...req.body,
      author
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
