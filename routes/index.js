var express = require("express");
var router = express.Router();

// userApi
const userApi = require("./userApi");
router.use("/users", userApi);

// authApi
const authApi = require("./authApi");
router.use("/auth", authApi);

// blogApi
const blogApi = require("./blogApi");
router.use("/blogs", blogApi);

module.exports = router;
