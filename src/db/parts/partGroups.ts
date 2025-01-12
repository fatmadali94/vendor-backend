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
    partNames: [{ type: mongoose.Schema.Types.ObjectId, ref: "PartNames" }],
  },
  {
    timestamps: true,
  }
);

export const partGroupModel = mongoose.model("PartGroups", PartGroupSchema);
export const getPartGroups = () =>
  partGroupModel
    .find()
    .populate({
      path: "partNames",
      model: "PartNames", // Ensures that Mongoose knows which model to use for population
    })
    .exec();

export const deletePartGroupById = (id: string) =>
  partGroupModel.findOneAndDelete({ _id: id });
export const updatePartGroupById = (id: string, values: Record<string, any>) =>
  partGroupModel.findByIdAndUpdate(id, values, {
    new: true,
  });
