import mongoose from "mongoose";
const ResourceCenterSchema = new mongoose.Schema(
  {
    image: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    slug: { type: String, required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const ResourceCenterModel = mongoose.model(
  "Resources",
  ResourceCenterSchema
);
