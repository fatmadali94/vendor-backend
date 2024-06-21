import mongoose from "mongoose";
const PartNameSchema = new mongoose.Schema(
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

export const partNameModel = mongoose.model("PartNames", PartNameSchema);
export const getPartNames = () => partNameModel.find();

export const deletePartNameById = (id: string) =>
  partNameModel.findOneAndDelete({ _id: id });
//
