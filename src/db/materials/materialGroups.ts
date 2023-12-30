import mongoose from "mongoose";
const MaterialGroupSchema = new mongoose.Schema(
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
    materialnames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaterialNames",
        required: false,
      },
    ],
    materialproviders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaterialProviders",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const materialGroupModel = mongoose.model(
  "MaterialGroups",
  MaterialGroupSchema
);
export const getMaterialGroups = () =>
  materialGroupModel.find().populate({
    path: "materialnames",
    populate: {
      path: "materialgrades",
      model: "MaterialGrades",
    },
  });

export const getMaterialGroupById = (id: string) =>
  materialGroupModel.findById(id).populate({
    path: "materialnames",
    populate: {
      path: "materialgrades",
      model: "MaterialGrades",
    },
  });
// export const createMaterialGroup = (values: Record<string, any>) =>
//   new materialGroupModel(values).save().then((user) => user.toObject());
export const deleteMaterialGroupById = (id: string) =>
  materialGroupModel.findOneAndDelete({ _id: id });
export const updateMaterialGroupById = (
  id: string,
  values: Record<string, any>
) =>
  materialGroupModel.findByIdAndUpdate(id, values, {
    new: true,
  });
