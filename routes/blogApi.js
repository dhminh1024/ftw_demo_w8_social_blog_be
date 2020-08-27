const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

/**
 * @route GET api/blogs?page=1&limit=10
 * @description Get blogs with pagination
 * @access Public
 */
router.get("/", blogController.getBlogs);

module.exports = router;
