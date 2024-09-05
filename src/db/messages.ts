import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: false,
  },
  content: { type: String, required: true },
  subject: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  response: { type: String },
  responseTimestamp: { type: Date },
});
export const MessageModel = mongoose.model("Message", MessageSchema);
export default MessageSchema; // Use this in other schemas as a subdocument
