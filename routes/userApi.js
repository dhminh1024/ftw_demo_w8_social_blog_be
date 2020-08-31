const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validators = require("../middlewares/validators");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/authentication");

/**
 * @route POST api/users
 * @description Register new user
 * @access Public
 */
router.post(
  "/",
  validators.validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("email", "Invalid email").exists().isEmail(),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userController.register
);

/**
 * @route GET api/users/me
 * @description Get current user info
 * @access Public
 */
router.get("/me", authMiddleware.loginRequired, userController.getCurrentUser);

module.exports = router;
