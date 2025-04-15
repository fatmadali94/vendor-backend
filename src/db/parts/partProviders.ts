import mongoose from "mongoose";
const PartProviderSchema = new mongoose.Schema(
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
    phone: { type: String, required: false },
    description: { type: String, required: false },
    address: { type: String, required: false },
    email: { type: String, required: false },
    records: [
      {
        partgroup: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PartGroups",
          required: false,
        },
        partname: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PartNames",
          required: false,
        },
        partgeneralid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PartGeneralIds",
          required: false,
        },
      },
    ],
    ratings: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Rating", required: false },
    ],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
  }
);

export const PartProviderModel = mongoose.model(
  "PartProviders",
  PartProviderSchema
);

export const getPartProviders = () => {
  const partProviders = PartProviderModel.find()
    .populate({
      path: "records.partgroup",
      model: "PartGroups", // Ensures that Mongoose knows which model to use for population
    })
    .populate({
      path: "records.partname",
      model: "PartNames", // Similarly, define the model for material names
    })
    .populate({
      path: "records.partgeneralid",
      model: "PartGeneralIds", // And for material grades
    })
    .exec();

  return partProviders;
};

export const getPartProviderById = (id: any) =>
  PartProviderModel.findById(id)
    .populate({
      path: "records.partgroup",
      model: "PartGroups", // Ensures that Mongoose knows which model to use for population
    })
    .populate({
      path: "records.partname",
      model: "PartNames", // Similarly, define the model for material names
    })
    .populate({
      path: "records.partgeneralid",
      model: "PartGeneralIds", // And for material grades
    })
    .populate({
      path: "ratings",
      model: "Rating",
      // select: "position companyId rating", // Only select specific fields from Rating
    })
    .populate({
      path: "comments",
      model: "Comment",
      // select: "position companyId rating", // Only select specific fields from Rating
    })
    .exec();

export const deletePartProviderById = (id: any) =>
  PartProviderModel.findOneAndDelete({ _id: id });
