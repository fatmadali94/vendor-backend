import mongoose from "mongoose";
const PartGroupSchema = new mongoose.Schema(
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
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const partGroupModel = mongoose.model("PartGroups", PartGroupSchema);
export const getPartGroups = () => partGroupModel.find();

export const deletePartGroupById = (id: string) =>
  partGroupModel.findOneAndDelete({ _id: id });
