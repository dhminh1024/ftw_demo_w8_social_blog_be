var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const utilsHelper = require("./helpers/utils.helper");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.plugin(require("./models/plugins/modifiedAt"));
const mongoURI = process.env.MONGODB_URI;

const multer = require("multer");
const upload = multer();

var indexRouter = require("./routes/index");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(upload.array());
app.use(cookieParser());

/* DB Connections */

mongoose
  .connect(mongoURI, {
    // some options to deal with deprecated warning
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Mongoose connected to ${mongoURI}`);
    // require("./testing/testSchema");
  })
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

/* Initialize Routes */
app.use("/api", indexRouter);

// catch 404 and forard to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.statusCode = 404;
  next(err);
});

/* Initialize Error Handling */
app.use((err, req, res, next) => {
  if(process.env.ENV_MODE === "development"){
    return utilsHelper.sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      err.stack,
      err.message,
    );
  } else {
    return utilsHelper.sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      null,
      err.message,
    );
  }
  
});

module.exports = app;
