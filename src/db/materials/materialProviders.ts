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
    name: { type: String, required: false },
    export_destination: { type: String, required: false },
    has_export: { type: Boolean, required: false },
    score: { type: Number, required: false },
    knowledge_based: { type: Boolean, required: false },
    establish_year: { type: Number, required: false },
    production_type: {
      type: String,
      enum: [
        "industrial-production",
        "semi-industrial-production",
        "trial-production",
      ],
      required: false,
    },
    production_volume: { type: Number, required: false },
    cooperation_length: { type: Number, required: false },
    link: { type: String, required: false },
    phone: { type: Number, required: false },
    description: { type: String, required: false },
    address: { type: String, required: false },
    email: { type: String, required: false },
    records: [
      {
        materialgroup: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MaterialGroups",
          required: false,
        },
        materialname: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MaterialNames",
          required: false,
        },
        materialgrade: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MaterialGrades",
          required: false,
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
  MaterialProviderModel.findById(id)
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

export const deleteMaterialProviderById = (id: any) =>
  MaterialProviderModel.findOneAndDelete({ _id: id });
