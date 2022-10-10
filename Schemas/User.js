const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
    default: null,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  password: {
    type: String,
    required: true,
  },
  contacts: {
    type: [mongoose.SchemaTypes.ObjectId],

    default: [],
  },
});

module.exports = mongoose.model("User", userSchema);
