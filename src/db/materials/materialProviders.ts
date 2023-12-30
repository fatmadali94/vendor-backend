import mongoose from "mongoose";
const MaterialProviderSchema = new mongoose.Schema(
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
    materialgrades: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaterialGrades",
        required: false,
      },
    ],
    materialnames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaterialNames",
        required: false,
      },
    ],
    materialgroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaterialGroups",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const MaterialProviderModel = mongoose.model(
  "MaterialProviders",
  MaterialProviderSchema
);
export const getMaterialProviders = () =>
  MaterialProviderModel.find().populate("materialgrades");

export const getMaterialProviderById = (id: any) =>
  MaterialProviderModel.findById(id);

export const deleteMaterialProviderById = (id: any) =>
  MaterialProviderModel.findOneAndDelete({ _id: id });
// export const updateMaterialProviderById = (id: string, values: Record<string, any>) =>
//   MaterialProviderModel.findByIdAndUpdate(id, values);
