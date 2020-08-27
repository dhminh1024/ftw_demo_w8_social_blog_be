const utilsHelper = require("../helpers/utils.helper");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const userController = {};

userController.register = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return next(new Error("User already exists"));

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    user = await User.create({
      name,
      email,
      password,
    });
    const accessToken = await user.generateToken();
    return utilsHelper.sendResponse(
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

module.exports = userController;
