import mongoose from "mongoose";
const PartProviderSchema = new mongoose.Schema(
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
    lng: { type: Number, required: false },
    lat: { type: Number, required: false },
    name: { type: String, required: true },
    link: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: Number, required: false },
    description: { type: String, required: false },
    partgeneralids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartGeneralIds",
        required: false,
      },
    ],
    partnames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartNames",
        required: false,
      },
    ],
    partgroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartGroups",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const PartProviderModel = mongoose.model(
  "PartProviders",
  PartProviderSchema
);
export const getPartProviders = () =>
  PartProviderModel.find().populate("partgeneralids");

export const getPartProviderById = (id: any) => PartProviderModel.findById(id);

export const deletePartProviderById = (id: any) =>
  PartProviderModel.findOneAndDelete({ _id: id });
// export const updatePartProviderById = (id: string, values: Record<string, any>) =>
//   PartProviderModel.findByIdAndUpdate(id, values);
