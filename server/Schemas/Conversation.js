const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const msgSchema = new Schema({
  date: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  msg: String,
  recipient: mongoose.SchemaTypes.ObjectId, // who receives the msg
  read: {
    type: Boolean,
    immutable: false,
    default: false,
  },
});

const conversationSchema = new Schema({
  users: {
    type: [mongoose.SchemaTypes.ObjectId],
    immutable: true,
  },
  msgHistory: {
    type: [msgSchema],
  },
});
module.exports = mongoose.model("Conversation", conversationSchema);
