var mongoose = require("mongoose");
var UserSchema = new mongoose.Schema({
  userEmailId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
  },
  groupsInvolved: {
    type: Array,
    default: [],
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

var User = mongoose.model("User", UserSchema);

module.exports = User;
