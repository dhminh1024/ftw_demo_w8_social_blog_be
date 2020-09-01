const User = require("../models/user");
const Friendship = require("../models/friendship");
const jwt = require("jsonwebtoken");
const { AppError, catchAsync, sendResponse } = require("../helpers/utils.helper");
const userController = {};
userController.register = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return next(new Error("User already exists"));


    user = await User.create({
      name,
      email,
      password,
    });
    const accessToken = await user.generateToken();
    return sendResponse(
      res,
      200,
      true,
      { user, accessToken },
      null,
      "Create user successful"
    );
  } catch (error) {
    next(error);
  }
};

userController.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    return sendResponse(
      res,
      200,
      true,
      { user },
      null,
      "Get current user successful"
    );
  } catch (error) {
    next(error);
  }
};

userController.sendFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // From
    const toUserId = req.params.id; // To
    let friendship = await Friendship.findOne({ from: userId, to: toUserId });
    if (!friendship) {
      await Friendship.create({
        from: userId,
        to: toUserId,
        status: "requesting",
      });
      return sendResponse(
        res,
        200,
        true,
        null,
        null,
        "Request has ben sent"
      );
    } else {
      switch (friendship.status) {
        case "requesting":
          return next(new Error("The request has already been sent"));
        case "accepted":
          return next(new Error("Users are already friend"));
        case "decline":
        case "cancel":
          // in case declined or cancelled, we're changing it to requesting
          friendship.status = "requesting";
          await friendship.save();
          return sendResponse(
            res,
            200,
            true,
            null,
            null,
            "Request has ben sent"
          );
        default:
          break;
      }
    }
  } catch (error) {
    next(error);
  }
};

userController.acceptFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // To
    const fromUserId = req.params.id; // From
    let friendship = await Friendship.findOne({
      from: fromUserId,
      to: userId,
      status: "requesting",
    });
    if (!friendship) return next(new Error("Friend Request not found"));
    // else
    friendship.status = "accepted";
    await friendship.save();
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Friend request has been accepted"
    );
  } catch (error) {
    next(error);
  }
};

userController.declineFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // To
    const fromUserId = req.params.id; // From
    let friendship = await Friendship.findOne({
      from: fromUserId,
      to: userId,
      status: "requesting",
    });
    if (!friendship) return next(new Error("Request not found"));

    friendship.status = "decline";
    await friendship.save();
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Friend request has been declined"
    );
  } catch (error) {
    next(error);
  }
};

userController.getSentFriendRequestList = async (req, res, next) => {
  try {
    const userId = req.userId;
    const requestList = await Friendship.find({
      from: userId,
      status: "requesting",
    }).populate("to");
    return sendResponse(res, 200, true, requestList, null, null);
  } catch (error) {
    next(error);
  }
};

userController.getReceivedFriendRequestList = async (req, res, next) => {
  try {
    const userId = req.userId;
    const requestList = await Friendship.find({
      to: userId,
      status: "requesting",
    }).populate("from");
    return sendResponse(res, 200, true, requestList, null, null);
  } catch (error) {
    next(error);
  }
};

userController.getFriendList = async (req, res, next) => {
  try {
    const userId = req.userId;
    let friendList = await Friendship.find({
      $or: [{ from: userId }, { to: userId }],
      status: "accepted",
    })
      .populate("from")
      .populate("to");
      
    friendList = friendList.map((friendship) => {
      const friend = {};
      friend.acceptedAt = friendship.updatedAt;
      if (friendship.from._id.equals(userId)) {
        friend.user = friendship.to;
      } else {
        friend.user = friendship.from;
      }
      return friend;
    });
    return sendResponse(res, 200, true, friendList, null, null);
  } catch (error) {
    next(error);
  }
};

userController.cancelFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // From
    const toUserId = req.params.id; // To
    let friendship = await Friendship.findOne({
      from: userId,
      to: toUserId,
      status: "requesting",
    });
    if (!friendship) return next(new Error("Request not found"));

    friendship.status = "cancel";
    await friendship.save();
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Friend request has been cancelled"
    );
  } catch (error) {
    next(error);
  }
};

userController.removeFriendship = async (req, res, next) => {
  try {
    const userId = req.userId;
    const toBeRemovedUserId = req.params.id;
    let friendship = await Friendship.findOne({
      $or: [
        { from: userId, to: toBeRemovedUserId },
        { from: toBeRemovedUserId, to: userId },
      ],
      status: "accepted",
    });
    if (!friendship) return next(new Error("Friend not found"));

    friendship.status = "removed";
    await friendship.save();
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Friendship has been removed"
    );
  } catch (error) {
    next(error);
  }
};

userController.forgetPassword = async (req,res,next) => {
  try {
    // get email from request 
    const email = req.params.email
    if(!email){
      return next(new Error("Email is required"))
    }
    // get user doc from database
    const user = await User.findOne({ email })
    if(!user){
       return sendResponse(
        res,
        200,
        true,
        null,
        null,
        "You will receive an email in your registered email address"
      );  
    }
    // generate a jwt (include userID)
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: "1h"});
    
    // SEND EMAIL
    const API_KEY = process.env.MAILGUN_API;
    const DOMAIN = process.env.MAILGUN_DOMAIN;
    const mailgun = require("mailgun-js")({apiKey: API_KEY, domain: DOMAIN});
    const data = {
      from: 'khoa <damanhkhoa@gmail.com>',
      to: user.email,
      subject: 'Reset password confirmation',
      html: `click <a href="http://frontendURL/email/${token}">here</a> to reset password`
    };
    console.log(token)
    mailgun.messages().send(data, (error, body) => {
      console.log(body);
      if(error) return next(body)
    });
    
    // send email with token to user email
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "You will receive an email in your registered email address"
    );  
} catch (error) {
    next(error);
  }
}


userController.resetPassword = async(req,res,next) => {
  try {
    let { token, password } = req.body;
    if(!token || !password) return next(new Error("token and password are required"));

    // verify token;
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY)
    if(!payload){
      return next(new Error("invalid token"));
    }
    // payload._id = userid
    //  update password;


    const user = await User.findById(payload._id);
    user.password = password;
    await user.save()


    res.send(user)
  } catch (error) {
    return next(error)
  }
}


userController.testError = catchAsync(async (req,res,next) => {
  console.log(hahahhaha)
  return next(new AppError(404, "Account not found"))
}) 
userController.updateProfile = catchAsync(async(req,res,next) => {
    const userId = req.userId;
    const allows = ["name", "password", "gender"]
    const user = await User.findOne({_id: userId, isDeleted: false});
    if(!user){
      return next(new AppError(404, "Account not found"))
    };

    allows.forEach(field => {
      if(req.body[field] !== undefined) {
        user[field] = req.body[field] 
      }
    })
    await user.save();

    return sendResponse(
      res,
      200,
      true,
      { user },
      null,
      "update current user successful"
    );
})
module.exports = userController;
