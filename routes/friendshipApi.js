const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const userController = require("../controllers/userController");
const { body, param } = require("express-validator");

/**
 * @route POST api/friends/add/:id
 * @description Send a friend request to an user
 * @access Login required
 */
router.post(
  "/add/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.sendFriendRequest
);

/**
 * @route DELETE api/friends/add/:id
 * @description Cancel a friend request to an user
 * @access Login required
 */
router.delete(
  "/add/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.cancelFriendRequest
);

/**
 * @route GET api/friends/add
 * @description Get the list of friend requests that are sent by the user
 * @access Login required
 */
router.get(
  "/add",
  authMiddleware.loginRequired,
  userController.getSentFriendRequestList
);

/**
 * @route GET api/friends/manage
 * @description Get the list of received friend requests
 * @access Login required
 */
router.get(
  "/manage",
  authMiddleware.loginRequired,
  userController.getReceivedFriendRequestList
);

/**
 * @route GET api/friends
 * @description Get the list of friends
 * @access Login required
 */
router.get("/", authMiddleware.loginRequired, userController.getFriendList);

/**
 * @route POST api/friends/manage/:id
 * @description Accept a friend request from an user
 * @access Login required
 */
router.post(
  "/manage/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.acceptFriendRequest
);

/**
 * @route DELETE api/friends/manage/:id
 * @description Decline a friend request from an user
 * @access Login required
 */
router.delete(
  "/manage/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.declineFriendRequest
);

/**
 * @route DELETE api/friends/:id
 * @description Remove a friend
 * @access Login required
 */
router.delete(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.removeFriendship
);

module.exports = router;
