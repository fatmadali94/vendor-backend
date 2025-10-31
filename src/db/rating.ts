import mongoose, { Schema, Document, ObjectId } from "mongoose";

interface IRating extends Document {
  provider: ObjectId; // ID of the provider being rated
  companyId: number; // Company ID, referring to the hard-coded company list
  position: string; // Position of the user (e.g., "procurement")
  user: ObjectId; // The ID of the verified user
  rating: number; // The current rating (e.g., out of 5)
  previousRatings: [
    {
      rating: number;
      timestamp: Date;
    }
  ]; // Archive of old ratings
  timestamp: Date; // When the latest rating was submitted
}

const ratingSchema = new Schema<IRating>({
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
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true },
  previousRatings: [
    {
      rating: { type: Number, required: false },
      timestamp: { type: Date, required: false },
    },
  ],
  timestamp: { type: Date, default: Date.now },
});

const Rating = mongoose.model<IRating>("Rating", ratingSchema);

export default Rating;
