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
    partGeneralIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "PartGeneralIds" },
    ],
  },
  {
    timestamps: true,
  }
);

export const partNameModel = mongoose.model("PartNames", PartNameSchema);
export const getPartNames = () =>
  partNameModel
    .find()
    .populate({
      path: "partGeneralIds",
      model: "PartGeneralIds", // Ensures that Mongoose knows which model to use for population
    })
    .exec();

export const deletePartNameById = (id: string) =>
  partNameModel.findOneAndDelete({ _id: id });
//
export const updatePartNameById = (id: string, values: Record<string, any>) =>
  partNameModel.findByIdAndUpdate(id, values, {
    new: true,
  });
