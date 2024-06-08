import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: Number, required: false },
  },
  {
    timestamps: true,
  }
);

export const MessageModel = mongoose.model("Message", MessageSchema);
export const getAllMessages = () => MessageModel.find();
