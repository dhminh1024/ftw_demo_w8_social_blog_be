module.exports = exports = isDeletedFalse = function (schema, options) {
  schema.pre(/^find/, function (next) {
    // console.log("in isDeletedPlugin", this._conditions);
    if (this._conditions["isDeleted"] === undefined)
      this._conditions["isDeleted"] = false;
    next();
  });
};
