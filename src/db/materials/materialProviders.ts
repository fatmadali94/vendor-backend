import mongoose from "mongoose";
const MaterialProviderSchema = new mongoose.Schema(
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
    lng: { type: Number, required: false },
    lat: { type: Number, required: false },
    name: { type: String, required: true },
    link: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: Number, required: false },
    description: { type: String, required: false },
    records: [
      {
        materialgroup: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MaterialGroups",
        },
        materialname: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MaterialNames",
        },
        materialgrade: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MaterialGrades",
        },
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
export const getMaterialProviders = () => {
  const materialProviders = MaterialProviderModel.find()
    .populate({
      path: "records.materialgroup",
      model: "MaterialGroups", // Ensures that Mongoose knows which model to use for population
    })
    .populate({
      path: "records.materialname",
      model: "MaterialNames", // Similarly, define the model for material names
    })
    .populate({
      path: "records.materialgrade",
      model: "MaterialGrades", // And for material grades
    })
    .exec();

  return materialProviders;
};
export const getMaterialProviderById = (id: any) =>
  MaterialProviderModel.findById(id);

export const deleteMaterialProviderById = (id: any) =>
  MaterialProviderModel.findOneAndDelete({ _id: id });
