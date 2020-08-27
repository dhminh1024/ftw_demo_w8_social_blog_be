const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const validators = require("../middlewares/validators");
const { param } = require("express-validator");

/**
 * @route GET api/blogs?page=1&limit=10
 * @description Get blogs with pagination
 * @access Public
 */
router.get("/", blogController.getBlogs);

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

module.exports = router;
