const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { body } = require("express-validator");
const reactionController = require("../controllers/reactionController");

/**
 * @route POST api/reactions
 * @description Save a reaction to blog or review
 * @access Login required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  validators.validate([
    body("targetType", "Invalid targetType").exists().isIn(["Blog", "Review"]),
    body("target", "Invalid target").exists().custom(validators.checkObjectId),
    body("emoji", "Invalid emoji")
      .exists()
      .isIn(["laugh", "sad", "like", "love", "angry"]),
  ]),
  reactionController.saveReaction
);

module.exports = router;
