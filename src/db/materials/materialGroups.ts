import mongoose from "mongoose";
const MaterialGroupSchema = new mongoose.Schema(
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

export const materialGroupModel = mongoose.model(
  "MaterialGroups",
  MaterialGroupSchema
);
export const getMaterialGroups = () => materialGroupModel.find();

export const getMaterialGroupById = (id: string) =>
  materialGroupModel.findById(id);

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
