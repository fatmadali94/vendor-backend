import mongoose from "mongoose";
const MaterialNameSchema = new mongoose.Schema(
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
    materialgroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaterialGroups",
        required: true,
      },
    ],
    materialproviders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaterialProviders",
        required: true,
      },
    ],
    materialgrades: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaterialGrades",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const materialNameModel = mongoose.model(
  "MaterialNames",
  MaterialNameSchema
);
export const getMaterialNames = () =>
  materialNameModel.find().populate("materialgroups");

export const getMaterialNameById = (id: string) =>
  materialNameModel.findById(id);
// export const createMaterialName = (values: any) =>
//   new materialNameModel(values).save().then((sub) => sub.toObject());
export const deleteMaterialNameById = (id: string) =>
  materialNameModel.findOneAndDelete({ _id: id });
export const updateMaterialNameById = (
  id: string,
  values: Record<string, any>
) => materialNameModel.findByIdAndUpdate(id, values);
