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
    materialNames: [
      { type: mongoose.Schema.Types.ObjectId, ref: "MaterialNames" },
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
  materialGroupModel
    .find()
    .populate({
      path: "materialNames",
      model: "MaterialNames", // Ensures that Mongoose knows which model to use for population
    })
    .exec();

export const getMaterialGroupById = (id: string) =>
  materialGroupModel
    .findById(id)
    .populate({
      path: "materialNames",
      model: "MaterialNames", // Ensures that Mongoose knows which model to use for population
    })
    .exec();

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
