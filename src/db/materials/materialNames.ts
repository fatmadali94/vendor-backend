import mongoose from "mongoose";
const MaterialNameSchema = new mongoose.Schema(
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
    materialGrades: [
      { type: mongoose.Schema.Types.ObjectId, ref: "MaterialGrades" },
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
  materialNameModel
    .find()
    .populate({
      path: "materialGrades",
      model: "MaterialGrades", // Ensures that Mongoose knows which model to use for population
    })
    .exec();

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
