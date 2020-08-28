const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const validators = require("../middlewares/validators");
const authMiddleware = require("../middlewares/authentication");
const { body, param } = require("express-validator");

/**
 * @route GET api/blogs?page=1&limit=10
 * @description Get blogs with pagination
 * @access Public
 */
router.get("/", authMiddleware.loginRequired, blogController.getBlogs);

/**
 * @route GET api/blogs/:id
 * @description Get a single blog
 * @access Public
 */
router.get(
  "/:id",
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  blogController.getSingleBlog
);

/**
 * @route POST api/blogs
 * @description Create a new blog
 * @access Login required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  validators.validate([
    body("title", "Missing title").exists().notEmpty(),
    body("content", "Missing content").exists().notEmpty(),
  ]),
  blogController.createNewBlog
);

module.exports = router;
