import mongoose from "mongoose";
const PartGroupSchema = new mongoose.Schema(
  {
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    partnames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartNames",
        required: false,
      },
    ],
    partproviders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartProviders",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const partGroupModel = mongoose.model("PartGroups", PartGroupSchema);
export const getPartGroups = () =>
  partGroupModel.find().populate({
    path: "partnames",
    populate: {
      path: "partgeneralids",
      model: "PartGeneralIds",
    },
  });
// partGroupModel.find();

export const getPartGroupById = (id: string) =>
  partGroupModel.findById(id).populate({
    path: "partnames",
    populate: {
      path: "partgeneralids",
      model: "PartGeneralIds",
    },
  });
// export const createPartGroup = (values: Record<string, any>) =>
//   new partGroupModel(values).save().then((user) => user.toObject());
export const deletePartGroupById = (id: string) =>
  partGroupModel.findOneAndDelete({ _id: id });
export const updatePartGroupById = (id: string, values: Record<string, any>) =>
  partGroupModel.findByIdAndUpdate(id, values, {
    new: true,
  });
