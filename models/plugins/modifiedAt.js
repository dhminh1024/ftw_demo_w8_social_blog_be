module.exports = exports = modifiedAt = function (schema, options) {
  schema.add({ updatedAt: Date });
  schema.add({ createdAt: Date });
  schema.pre("save", function (next) {
    this.updatedAt = Date.now();
    if (!this.createdAt) {
      this.createdAt = Date.now();
    }
    next();
  });
};
