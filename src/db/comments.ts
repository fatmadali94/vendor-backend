// models/comment.js
import mongoose, { Schema, Document, ObjectId } from "mongoose";

interface IComment extends Document {
  user: ObjectId; // ID of the User leaving the comment
  provider: ObjectId; // ID of the Provider receiving the comment
  content: string; // The content of the comment
  position: string; // Position of the user (e.g., "procurement")
  companyId: number; // Company ID, referring to the hard-coded company list
  timestamp: Date; // The timestamp when the comment was left
}

const commentSchema = new Schema<IComment>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: true,
  },
  companyId: { type: Number, required: true }, // Refers to the hard-coded company ID
  position: {
    type: String,
    enum: [
      "procurement",
      "quality_control",
      "research_development",
      "quality_assurance",
      "technical_office"
    ],
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Comment = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
