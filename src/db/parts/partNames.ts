import mongoose from "mongoose";
const PartNameSchema = new mongoose.Schema(
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
    slug: { type: String, required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
    partgroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartGroups",
        required: true,
      },
    ],
    partproviders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartProviders",
        required: true,
      },
    ],
    partgeneralids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartGeneralIds",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const partNameModel = mongoose.model("PartNames", PartNameSchema);
export const getPartNames = () => partNameModel.find().populate("partgroups");

export const getPartNameById = (id: string) => partNameModel.findById(id);
// export const createPartName = (values: any) =>
//   new partNameModel(values).save().then((sub) => sub.toObject());
export const deletePartNameById = (id: string) =>
  partNameModel.findOneAndDelete({ _id: id });
export const updatePartNameById = (id: string, values: Record<string, any>) =>
  partNameModel.findByIdAndUpdate(id, values);
