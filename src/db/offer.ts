import mongoose from "mongoose";
const OfferSchema = new mongoose.Schema(
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
    title: { type: String, required: false },
    name: { type: String, required: false },
    description: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: Number, required: false },
  },
  {
    timestamps: true,
  }
);

export const OfferModel = mongoose.model("Offer", OfferSchema);
export const getOffers = () => OfferModel.find();
