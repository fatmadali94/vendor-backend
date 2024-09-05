import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: { type: Number, required: true, min: 1, max: 5 }, // Rating out of 5
  comment: { type: String }, // Optional comment field
  timestamp: { type: Date, default: Date.now },
});

export default reviewSchema;
